'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { fetchWithRetry } from '@/lib/fetchWithRetry';

const THREADS_PER_PAGE = 20;

// Request ID counters — used to ignore stale responses from concurrent fetches
let _hotRequestId = 0;
let _newRequestId = 0;

export const useForumStore = create((set, get) => ({
  forums: [],
  forumsLoaded: false,
  forumsLoading: true,
  threadPages: {},     // keyed by forumId: { items, hasMore, totalCount, page, loading }
  searchState: {},     // keyed by forumId|'global': { results, loading, query }
  recentThreads: { items: [], loading: true },
  hotThreadsLoaded: false,
  newThreads: { items: [], loading: true },
  newThreadsLoaded: false,
  _abortControllers: {},

  // Cancel a specific pending fetch
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

  // Cancel all pending fetches (called on route cleanup)
  cancelAll: () => {
    const controllers = get()._abortControllers;
    for (const ctrl of Object.values(controllers)) {
      ctrl.abort();
    }
    set({ _abortControllers: {} });
  },

  getSnapshot: () => {
    const s = get();
    return {
      forumPages: Object.keys(s.threadPages).length,
      searchKeys: Object.keys(s.searchState).length,
      hotLoaded: s.hotThreadsLoaded,
      newLoaded: s.newThreadsLoaded,
      pendingAborts: Object.keys(s._abortControllers).length,
    };
  },

  // Reset cached flags so next fetch actually hits the DB.
  // IMPORTANT: Keep existing items visible while refetching (don't flash "Loading...").
  // Only clear items if explicitly requested (e.g. route change to a different page).
  invalidate: ({ clearItems = false } = {}) => {
    const s = get();
    set({
      hotThreadsLoaded: false,
      newThreadsLoaded: false,
      recentThreads: clearItems
        ? { items: [], loading: true }
        : { items: s.recentThreads.items, loading: s.recentThreads.items.length === 0 },
      newThreads: clearItems
        ? { items: [], loading: true }
        : { items: s.newThreads.items, loading: s.newThreads.items.length === 0 },
      threadPages: {},
      searchState: {},
    });
  },

  fetchForums: async () => {
    if (get().forumsLoaded) return get().forums;

    try {
      const supabase = createClient();
      const { data } = await fetchWithRetry(
        () => supabase
          .from('forums')
          .select('*')
          .order('category')
          .order('name')
      );

      const forums = data || [];
      set({ forums, forumsLoaded: true, forumsLoading: false });
      return forums;
    } catch (err) {
      console.error('[forumStore] fetchForums error:', err);
      set({ forumsLoaded: true, forumsLoading: false });
      return [];
    }
  },

  fetchThreads: async (forumId) => {
    if (!forumId) return;

    get().cancelPending('fetchThreads');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchThreads: controller },
      threadPages: {
        ...state.threadPages,
        [forumId]: { ...(state.threadPages[forumId] || {}), loading: true },
      },
    }));

    try {
      const supabase = createClient();
      // Query threads through junction table (one thread, many forums)
      const { data, count } = await fetchWithRetry(
        () => supabase
          .from('threads')
          .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, drug_signature, avatar_url, is_founding_member), thread_forums!inner(forum_id)', { count: 'exact' })
          .eq('thread_forums.forum_id', forumId)
          .order('pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .abortSignal(controller.signal)
          .range(0, THREADS_PER_PAGE - 1),
        { signal: controller.signal }
      );

      const rows = data || [];
      const total = count ?? rows.length;

      set((state) => ({
        threadPages: {
          ...state.threadPages,
          [forumId]: {
            items: rows,
            hasMore: rows.length < total,
            totalCount: total,
            page: 0,
            loading: false,
          },
        },
      }));
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[forumStore] fetchThreads error:', err);
      set((state) => ({
        threadPages: {
          ...state.threadPages,
          [forumId]: { ...(state.threadPages[forumId] || {}), loading: false },
        },
      }));
    }
  },

  loadMoreThreads: async (forumId) => {
    if (!forumId) return;

    const current = get().threadPages[forumId];
    if (!current || current.loading) return;

    get().cancelPending('loadMoreThreads');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, loadMoreThreads: controller },
      threadPages: {
        ...state.threadPages,
        [forumId]: { ...current, loading: true },
      },
    }));

    try {
      const supabase = createClient();
      const nextPage = current.page + 1;
      const from = nextPage * THREADS_PER_PAGE;
      const to = from + THREADS_PER_PAGE - 1;

      const { data, count } = await supabase
        .from('threads')
        .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, drug_signature, avatar_url, is_founding_member), thread_forums!inner(forum_id)', { count: 'exact' })
        .eq('thread_forums.forum_id', forumId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal)
        .range(from, to);

      const rows = data || [];
      const total = count ?? current.totalCount;

      set((state) => ({
        threadPages: {
          ...state.threadPages,
          [forumId]: {
            items: [...(state.threadPages[forumId]?.items || []), ...rows],
            hasMore: from + rows.length < total,
            totalCount: total,
            page: nextPage,
            loading: false,
          },
        },
      }));
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[forumStore] loadMoreThreads error:', err);
      set((state) => ({
        threadPages: {
          ...state.threadPages,
          [forumId]: { ...(state.threadPages[forumId] || {}), loading: false },
        },
      }));
    }
  },

  fetchHotThreads: async (limit = 10, { force = false } = {}) => {
    if (!force && get().hotThreadsLoaded) return;
    get().cancelPending('fetchHotThreads');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchHotThreads: controller },
    }));
    const requestId = ++_hotRequestId;
    set({ recentThreads: { items: get().recentThreads.items, loading: true } });
    try {
      const supabase = createClient();
      const selectFields = '*, profiles:user_id(display_name, is_peer_advisor, avatar_url, is_founding_member), thread_forums(forum_id, forums:forum_id(name, slug, drug_slug))';

      // Try recent threads from last 30 days first, then widen if needed
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

      let { data, error } = await supabase
        .from('threads')
        .select(selectFields)
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal)
        .limit(50);

      if (error) console.error('[forumStore] fetchHotThreads query error:', error);

      // Stale response — a newer request was fired, ignore this one
      if (requestId !== _hotRequestId) {
        set({ recentThreads: { items: get().recentThreads.items, loading: false } });
        return;
      }

      let threads = data || [];

      // If not enough recent threads, backfill with latest all-time
      if (threads.length < limit) {
        const existingIds = new Set(threads.map((t) => t.id));
        const { data: backfillData, error: backfillError } = await supabase
          .from('threads')
          .select(selectFields)
          .order('created_at', { ascending: false })
          .abortSignal(controller.signal)
          .limit(limit * 3);

        if (backfillError) console.error('[forumStore] fetchHotThreads backfill error:', backfillError);

        // Check staleness again after second await
        if (requestId !== _hotRequestId) {
          set({ recentThreads: { items: get().recentThreads.items, loading: false } });
          return;
        }

        (backfillData || []).forEach((t) => {
          if (!existingIds.has(t.id)) threads.push(t);
        });
      }

      // Fetch reply engagement for these threads (comment likes + helpful votes)
      const threadIds = threads.map((t) => t.id);
      const replyEngagement = {};
      if (threadIds.length > 0) {
        const { data: replyData } = await supabase
          .from('replies')
          .select('thread_id, vote_score, helpful_count')
          .in('thread_id', threadIds)
          .abortSignal(controller.signal);

        if (requestId !== _hotRequestId) {
          set({ recentThreads: { items: get().recentThreads.items, loading: false } });
          return;
        }

        (replyData || []).forEach((r) => {
          if (!replyEngagement[r.thread_id]) replyEngagement[r.thread_id] = 0;
          replyEngagement[r.thread_id] += (r.vote_score || 0) + (r.helpful_count || 0);
        });
      }

      // Hot ranking: pure engagement — thread likes + reply count + reply likes
      threads.sort((a, b) => {
        const replyEngA = replyEngagement[a.id] || 0;
        const replyEngB = replyEngagement[b.id] || 0;
        const scoreA = (a.vote_score || 0) + (a.reply_count || 0) + replyEngA;
        const scoreB = (b.vote_score || 0) + (b.reply_count || 0) + replyEngB;
        return scoreB - scoreA;
      });
      threads = threads.slice(0, limit);

      set({ recentThreads: { items: threads, loading: false }, hotThreadsLoaded: true });
    } catch (err) {
      if (err.name === 'AbortError') {
        // Clear loading so a subsequent fetch isn't blocked by stale loading state
        set({ recentThreads: { items: get().recentThreads.items, loading: false } });
        return;
      }
      if (requestId !== _hotRequestId) {
        set({ recentThreads: { items: get().recentThreads.items, loading: false } });
        return;
      }
      console.error('[forumStore] fetchHotThreads error:', err);
      // Don't mark as loaded on error — allow retries
      set({ recentThreads: { items: get().recentThreads.items, loading: false } });
    }
  },

  fetchNewThreads: async (limit = 10, { force = false } = {}) => {
    if (!force && get().newThreadsLoaded) return;
    get().cancelPending('fetchNewThreads');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchNewThreads: controller },
    }));
    const requestId = ++_newRequestId;
    set({ newThreads: { items: get().newThreads.items, loading: true } });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('threads')
        .select('*, profiles:user_id(display_name, is_peer_advisor, avatar_url, is_founding_member), thread_forums(forum_id, forums:forum_id(name, slug, drug_slug))')
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal)
        .limit(limit);

      if (error) console.error('[forumStore] fetchNewThreads query error:', error);

      // Stale response — a newer request was fired, ignore this one
      if (requestId !== _newRequestId) {
        set({ newThreads: { items: get().newThreads.items, loading: false } });
        return;
      }

      set({ newThreads: { items: data || [], loading: false }, newThreadsLoaded: true });
    } catch (err) {
      if (err.name === 'AbortError') {
        set({ newThreads: { items: get().newThreads.items, loading: false } });
        return;
      }
      if (requestId !== _newRequestId) {
        set({ newThreads: { items: get().newThreads.items, loading: false } });
        return;
      }
      console.error('[forumStore] fetchNewThreads error:', err);
      set({ newThreads: { items: get().newThreads.items, loading: false } });
    }
  },

  search: async (forumId, query) => {
    const key = forumId || 'global';

    if (!query || query.trim().length < 2) {
      set((state) => ({
        searchState: { ...state.searchState, [key]: { results: [], loading: false, query: '' } },
      }));
      return;
    }

    get().cancelPending('search');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, search: controller },
      searchState: { ...state.searchState, [key]: { results: [], loading: true, query } },
    }));

    try {
      const supabase = createClient();

      if (forumId) {
        // Forum-specific search: use FTS with prefix matching
        // Build prefix query: "withdr" → "withdr:*", "withdrawal sym" → "withdrawal & sym:*"
        const words = query.trim().split(/\s+/).filter(Boolean);
        const prefixQuery = words.map((w, i) => i === words.length - 1 ? `${w}:*` : w).join(' & ');

        const { data } = await supabase
          .from('threads')
          .select('*, profiles:user_id(display_name, is_peer_advisor, avatar_url, is_founding_member), forums:forum_id(name, slug, drug_slug), thread_forums!inner(forum_id)')
          .textSearch('fts', prefixQuery)
          .eq('thread_forums.forum_id', forumId)
          .order('created_at', { ascending: false })
          .abortSignal(controller.signal)
          .limit(20);

        set((state) => ({
          searchState: { ...state.searchState, [key]: { results: data || [], loading: false, query } },
        }));
      } else {
        // Global search: use unified RPC across threads + replies
        const { data, error } = await supabase
          .rpc('search_all', { search_query: query, result_limit: 30 })
          .abortSignal(controller.signal);

        if (error) throw error;

        set((state) => ({
          searchState: { ...state.searchState, [key]: { results: data || [], loading: false, query } },
        }));
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[forumStore] search error:', err);
      set((state) => ({
        searchState: { ...state.searchState, [key]: { results: [], loading: false, query } },
      }));
    }
  },
}));
