'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

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

  // Reset cached flags so next fetch actually hits the DB
  invalidate: () => {
    set({
      hotThreadsLoaded: false,
      newThreadsLoaded: false,
      recentThreads: { items: [], loading: true },
      newThreads: { items: [], loading: true },
      threadPages: {},
      searchState: {},
    });
  },

  fetchForums: async () => {
    if (get().forumsLoaded) return get().forums;

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('forums')
        .select('*')
        .order('category')
        .order('name');

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

    const supabase = createClient();

    set((state) => ({
      threadPages: {
        ...state.threadPages,
        [forumId]: { ...(state.threadPages[forumId] || {}), loading: true },
      },
    }));

    try {
      // Query threads through junction table (one thread, many forums)
      const { data, count } = await supabase
        .from('threads')
        .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, drug_signature, avatar_url, is_founding_member), thread_forums!inner(forum_id)', { count: 'exact' })
        .eq('thread_forums.forum_id', forumId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(0, THREADS_PER_PAGE - 1);

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

    const supabase = createClient();
    const current = get().threadPages[forumId];
    if (!current) return;

    const nextPage = current.page + 1;
    const from = nextPage * THREADS_PER_PAGE;
    const to = from + THREADS_PER_PAGE - 1;

    const { data, count } = await supabase
      .from('threads')
      .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, drug_signature, avatar_url, is_founding_member), thread_forums!inner(forum_id)', { count: 'exact' })
      .eq('thread_forums.forum_id', forumId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    const rows = data || [];
    const total = count ?? current.totalCount;

    set((state) => ({
      threadPages: {
        ...state.threadPages,
        [forumId]: {
          items: [...current.items, ...rows],
          hasMore: from + rows.length < total,
          totalCount: total,
          page: nextPage,
          loading: false,
        },
      },
    }));
  },

  fetchHotThreads: async (limit = 10, { force = false } = {}) => {
    if (!force && get().hotThreadsLoaded) return;
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
        .limit(50);

      if (error) console.error('[forumStore] fetchHotThreads query error:', error);

      // Stale response — a newer request was fired, ignore this one
      if (requestId !== _hotRequestId) return;

      let threads = data || [];

      // If not enough recent threads, backfill with latest all-time
      if (threads.length < limit) {
        const existingIds = new Set(threads.map((t) => t.id));
        const { data: backfillData, error: backfillError } = await supabase
          .from('threads')
          .select(selectFields)
          .order('created_at', { ascending: false })
          .limit(limit * 3);

        if (backfillError) console.error('[forumStore] fetchHotThreads backfill error:', backfillError);

        // Check staleness again after second await
        if (requestId !== _hotRequestId) return;

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
          .in('thread_id', threadIds);

        if (requestId !== _hotRequestId) return;

        (replyData || []).forEach((r) => {
          if (!replyEngagement[r.thread_id]) replyEngagement[r.thread_id] = 0;
          replyEngagement[r.thread_id] += (r.vote_score || 0) + (r.helpful_count || 0);
        });
      }

      // Hot ranking: thread votes + reply count + reply engagement, decayed by age
      const now = Date.now();
      threads.sort((a, b) => {
        const replyEngA = replyEngagement[a.id] || 0;
        const replyEngB = replyEngagement[b.id] || 0;
        const scoreA = (a.vote_score || 0) + (a.reply_count || 0) + replyEngA;
        const scoreB = (b.vote_score || 0) + (b.reply_count || 0) + replyEngB;
        const ageHoursA = Math.max((now - new Date(a.created_at).getTime()) / 3600000, 0.1);
        const ageHoursB = Math.max((now - new Date(b.created_at).getTime()) / 3600000, 0.1);
        const hotA = (Math.log10(Math.max(scoreA, 1)) + 1) / Math.pow(ageHoursA / 6 + 1, 0.5);
        const hotB = (Math.log10(Math.max(scoreB, 1)) + 1) / Math.pow(ageHoursB / 6 + 1, 0.5);
        return hotB - hotA;
      });
      threads = threads.slice(0, limit);

      set({ recentThreads: { items: threads, loading: false }, hotThreadsLoaded: true });
    } catch (err) {
      if (requestId !== _hotRequestId) return;
      console.error('[forumStore] fetchHotThreads error:', err);
      // Don't mark as loaded on error — allow retries
      set({ recentThreads: { items: get().recentThreads.items, loading: false } });
    }
  },

  fetchNewThreads: async (limit = 10, { force = false } = {}) => {
    if (!force && get().newThreadsLoaded) return;
    const requestId = ++_newRequestId;
    set({ newThreads: { items: get().newThreads.items, loading: true } });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('threads')
        .select('*, profiles:user_id(display_name, is_peer_advisor, avatar_url, is_founding_member), thread_forums(forum_id, forums:forum_id(name, slug, drug_slug))')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) console.error('[forumStore] fetchNewThreads query error:', error);

      // Stale response — a newer request was fired, ignore this one
      if (requestId !== _newRequestId) return;

      set({ newThreads: { items: data || [], loading: false }, newThreadsLoaded: true });
    } catch (err) {
      if (requestId !== _newRequestId) return;
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

    set((state) => ({
      searchState: { ...state.searchState, [key]: { results: [], loading: true, query } },
    }));

    try {
      const supabase = createClient();
      const selectFields = forumId
        ? '*, profiles:user_id(display_name, is_peer_advisor, avatar_url, is_founding_member), forums:forum_id(name, slug, drug_slug), thread_forums!inner(forum_id)'
        : '*, profiles:user_id(display_name, is_peer_advisor, avatar_url, is_founding_member), forums:forum_id(name, slug, drug_slug)';

      let qb = supabase
        .from('threads')
        .select(selectFields)
        .textSearch('title', query)
        .order('created_at', { ascending: false })
        .limit(20);

      if (forumId) {
        qb = qb.eq('thread_forums.forum_id', forumId);
      }

      const { data } = await qb;

      set((state) => ({
        searchState: { ...state.searchState, [key]: { results: data || [], loading: false, query } },
      }));
    } catch (err) {
      console.error('[forumStore] search error:', err);
      set((state) => ({
        searchState: { ...state.searchState, [key]: { results: [], loading: false, query } },
      }));
    }
  },
}));
