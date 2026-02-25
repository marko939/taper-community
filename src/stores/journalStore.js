'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { fireAndForget } from '@/lib/fireAndForget';
import { useAuthStore } from './authStore';

export const useJournalStore = create((set, get) => ({
  entries: [],
  entriesLoaded: false,
  loading: true,
  shareToken: null,
  sharedEntries: {},   // keyed by shareToken: { entries, loading }
  publicEntries: {},   // keyed by userId: { entries, loading }

  fetchEntries: async () => {
    if (get().entriesLoaded) return;
    const supabase = createClient();
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    set({ entries: data || [], entriesLoaded: true, loading: false });
  },

  addEntry: async (entry) => {
    const supabase = createClient();
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return { data: null, error: { message: 'Not authenticated' } };

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
    const userId = useAuthStore.getState().user?.id;
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
    if (get().sharedEntries[shareToken]) return;

    set((state) => ({
      sharedEntries: { ...state.sharedEntries, [shareToken]: { entries: [], loading: true } },
    }));

    const supabase = createClient();

    const { data: share } = await supabase
      .from('journal_shares')
      .select('user_id')
      .eq('share_token', shareToken)
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
      .order('date', { ascending: true });

    set((state) => ({
      sharedEntries: { ...state.sharedEntries, [shareToken]: { entries: data || [], loading: false } },
    }));
  },

  fetchPublicEntries: async (userId) => {
    if (!userId) return;
    if (get().publicEntries[userId]) return;

    set((state) => ({
      publicEntries: { ...state.publicEntries, [userId]: { entries: [], loading: true } },
    }));

    const supabase = createClient();
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('date', { ascending: false });

    set((state) => ({
      publicEntries: { ...state.publicEntries, [userId]: { entries: data || [], loading: false } },
    }));
  },
}));
