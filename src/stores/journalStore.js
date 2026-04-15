'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { ensureSession } from '@/lib/ensureSession';
import { fireAndForget } from '@/lib/fireAndForget';
import { useAuthStore, getCurrentUserId } from './authStore';

export const useJournalStore = create((set, get) => ({
  entries: [],
  entriesLoaded: false,
  loading: true,
  shareToken: null,
  sharedEntries: {},   // keyed by shareToken: { entries, loading }
  publicEntries: {},   // keyed by userId: { entries, loading }
  _abortControllers: {},

  cancelPending: (opName) => {
    const ctrl = get()._abortControllers[opName];
    if (ctrl) {
      ctrl.abort();
      set((state) => {
        const controllers = { ...state._abortControllers };
        delete controllers[opName];
        return { _abortControllers: controllers };
      });
    }
  },

  cancelAll: () => {
    const controllers = get()._abortControllers;
    for (const ctrl of Object.values(controllers)) {
      ctrl.abort();
    }
    set({ _abortControllers: {} });
  },

  pruneSharedState: () => {
    set({ sharedEntries: {}, publicEntries: {} });
  },

  invalidate: () => {
    set({ entriesLoaded: false, loading: true });
  },

  fetchEntries: async () => {
    if (get().entriesLoaded) return;
    const userId = getCurrentUserId();
    if (!userId) { set({ loading: false }); return; }

    get().cancelPending('fetchEntries');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchEntries: controller },
    }));

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .abortSignal(controller.signal);

      set({ entries: data || [], entriesLoaded: true, loading: false });
    } catch (err) {
      // Clear loading on every exit (including abort) — invalidate() sets
      // loading: true on tab return and we must not leave it stuck if the
      // refetch is then aborted by a navigation.
      set({ loading: false });
      if (err.name === 'AbortError') return;
      console.error('[journalStore] fetchEntries error:', err);
    }
  },

  addEntry: async (entry) => {
    const supabase = createClient();
    const userId = getCurrentUserId();
    if (!userId) return { data: null, error: { message: 'Not authenticated' } };

    // Ensure session is valid before inserting
    await ensureSession();

    // Auto-generate title if not provided
    if (!entry.title) {
      const ordinal = (n) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
      };
      const dateFmt = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (entry.drug) {
        const { count } = await supabase
          .from('journal_entries')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('drug', entry.drug);
        entry.title = `${ordinal((count || 0) + 1)} ${entry.drug} Check-in — ${dateFmt}`;
      } else {
        entry.title = `Check-in — ${dateFmt}`;
      }
    }

    const { published_forums = [], ...entryData } = entry;

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        ...entryData,
        user_id: userId,
        is_public: entry.is_public || false,
        published_forums: published_forums,
        thread_ids: [],
      })
      .select()
      .single();

    if (error) {
      console.error('[journal] Insert failed:', error.message);
      return { data: null, error };
    }

    // Cross-post to forums as a single thread (best-effort)
    if (data && published_forums.length > 0 && entry.notes) {
      try {
        const threadTitle = entry.title || `${entry.drug || 'Journal'} — ${new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

        // Create ONE thread (primary forum = first selected)
        const { data: thread, error: threadErr } = await supabase
          .from('threads')
          .insert({
            forum_id: published_forums[0],
            user_id: userId,
            title: threadTitle,
            body: entry.notes,
            tags: ['taper update'],
          })
          .select('id')
          .single();

        if (threadErr) console.warn('[journal] Thread creation failed:', threadErr.message);

        if (thread) {
          // Link thread to ALL selected forums via junction table (fire-and-forget)
          const forumLinks = published_forums.map((forumId) => ({
            thread_id: thread.id,
            forum_id: forumId,
          }));
          fireAndForget('journal-link-thread-forums', () =>
            supabase.from('thread_forums').insert(forumLinks)
          );

          // Update journal entry with thread ID (fire-and-forget)
          fireAndForget('journal-update-thread-ids', () =>
            supabase
              .from('journal_entries')
              .update({ thread_ids: [thread.id] })
              .eq('id', data.id)
          );
          data.thread_ids = [thread.id];
        }
      } catch (err) {
        console.warn('[journal] Cross-post failed:', err.message);
      }
    }

    if (data) {
      set((state) => ({ entries: [data, ...state.entries] }));
    }
    return { data, error: null };
  },

  getShareLink: async () => {
    const supabase = createClient();
    const userId = getCurrentUserId();
    if (!userId) return null;

    // Check for existing share
    const { data: existing } = await supabase
      .from('journal_shares')
      .select('share_token')
      .eq('user_id', userId)
      .single();

    if (existing) {
      set({ shareToken: existing.share_token });
      return existing.share_token;
    }

    // Create new share
    const { data } = await supabase
      .from('journal_shares')
      .insert({ user_id: userId })
      .select('share_token')
      .single();

    const token = data?.share_token || null;
    set({ shareToken: token });
    return token;
  },

  fetchSharedEntries: async (shareToken) => {
    if (!shareToken) return;
    if (get().sharedEntries[shareToken]?.entries?.length > 0) return;

    get().cancelPending('fetchSharedEntries');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchSharedEntries: controller },
      sharedEntries: { ...state.sharedEntries, [shareToken]: { entries: [], loading: true } },
    }));

    try {
      const supabase = createClient();

      const { data: share } = await supabase
        .from('journal_shares')
        .select('user_id')
        .eq('share_token', shareToken)
        .abortSignal(controller.signal)
        .single();

      if (!share) {
        set((state) => ({
          sharedEntries: { ...state.sharedEntries, [shareToken]: { entries: [], loading: false } },
        }));
        return;
      }

      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', share.user_id)
        .order('date', { ascending: true })
        .abortSignal(controller.signal);

      set((state) => ({
        sharedEntries: { ...state.sharedEntries, [shareToken]: { entries: data || [], loading: false } },
      }));
    } catch (err) {
      // Clear loading on every exit (including abort) so the shared-journey
      // page doesn't spin forever after a navigation interrupt.
      set((state) => ({
        sharedEntries: {
          ...state.sharedEntries,
          [shareToken]: {
            entries: state.sharedEntries[shareToken]?.entries || [],
            loading: false,
          },
        },
      }));
      if (err.name === 'AbortError') return;
      console.error('[journalStore] fetchSharedEntries error:', err);
    }
  },

  // -- Shared Journeys (new share feature) --
  sharedJourneys: [],
  sharedJourneysLoaded: false,

  createSharedJourney: async (context) => {
    const supabase = createClient();
    const userId = getCurrentUserId();
    const profile = useAuthStore.getState().profile;
    if (!userId) return null;

    await ensureSession();

    const entries = get().entries;
    const snapshot = {
      profile: { display_name: profile?.display_name, drug: profile?.drug, taper_stage: profile?.taper_stage },
      entries: entries.map((e) => ({
        date: e.date,
        drug: e.drug,
        current_dose: e.current_dose,
        dose_numeric: e.dose_numeric,
        mood_score: e.mood_score,
        symptoms: e.symptoms,
      })),
    };

    const { data, error } = await supabase
      .from('shared_journeys')
      .insert({ user_id: userId, journey_snapshot: snapshot, share_context: context })
      .select('id')
      .single();

    if (error) {
      console.error('[journalStore] createSharedJourney error:', error);
      return null;
    }
    return data?.id || null;
  },

  fetchUserShares: async () => {
    if (get().sharedJourneysLoaded) return;
    const userId = getCurrentUserId();
    if (!userId) return;

    get().cancelPending('fetchUserShares');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchUserShares: controller },
    }));

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('shared_journeys')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal);

      set({ sharedJourneys: data || [], sharedJourneysLoaded: true });
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[journalStore] fetchUserShares error:', err);
    }
  },

  revokeShare: async (id) => {
    const supabase = createClient();
    await ensureSession();

    const { error } = await supabase
      .from('shared_journeys')
      .update({ is_active: false })
      .eq('id', id);

    if (!error) {
      set((state) => ({
        sharedJourneys: state.sharedJourneys.filter((s) => s.id !== id),
      }));
    }
  },

  fetchPublicEntries: async (userId) => {
    if (!userId) return;
    if (get().publicEntries[userId] && !get().publicEntries[userId].loading) return;

    get().cancelPending('fetchPublicEntries');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchPublicEntries: controller },
      publicEntries: { ...state.publicEntries, [userId]: { entries: [], loading: true } },
    }));

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('date', { ascending: false })
        .abortSignal(controller.signal);

      set((state) => ({
        publicEntries: { ...state.publicEntries, [userId]: { entries: data || [], loading: false } },
      }));
    } catch (err) {
      // Clear loading on every exit (including abort) so the public journal
      // tab on a profile page doesn't spin forever after a nav interrupt.
      set((state) => ({
        publicEntries: {
          ...state.publicEntries,
          [userId]: {
            entries: state.publicEntries[userId]?.entries || [],
            loading: false,
          },
        },
      }));
      if (err.name === 'AbortError') return;
      console.error('[journalStore] fetchPublicEntries error:', err);
    }
  },
}));
