'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

const THREADS_PER_PAGE = 20;

export const useForumStore = create((set, get) => ({
  forums: [],
  forumsLoaded: false,
  forumsLoading: true,
  threadPages: {},     // keyed by forumId: { items, hasMore, totalCount, page, loading }
  searchState: {},     // keyed by forumId|'global': { results, loading, query }
  recentThreads: { items: [], loading: true },
  hotThreadsLoaded: false,

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

  fetchHotThreads: async (limit = 15) => {
    if (get().hotThreadsLoaded) return;
    try {
      const supabase = createClient();
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

      // Fetch recent threads with engagement data
      let { data } = await supabase
        .from('threads')
        .select('*, profiles:user_id(display_name, is_peer_advisor, avatar_url, is_founding_member), forums:forum_id(name, drug_slug, slug), thread_forums(forum_id, forums:forum_id(name, slug, drug_slug))')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(50);

      let threads = data || [];

      // If not enough recent threads, backfill with top all-time
      if (threads.length < limit) {
        const existingIds = new Set(threads.map((t) => t.id));
        const { data: topData } = await supabase
          .from('threads')
          .select('*, profiles:user_id(display_name, is_peer_advisor, avatar_url, is_founding_member), forums:forum_id(name, drug_slug, slug), thread_forums(forum_id, forums:forum_id(name, slug, drug_slug))')
          .order('vote_score', { ascending: false })
          .limit(limit);
        (topData || []).forEach((t) => {
          if (!existingIds.has(t.id)) threads.push(t);
        });
      }

      // Reddit-style hot score: combines votes, replies, and recency
      const now = Date.now();
      threads = threads.map((t) => {
        const ageHours = Math.max((now - new Date(t.created_at).getTime()) / 3600000, 0.1);
        const votes = Math.max(t.vote_score || 0, 0);
        const replies = t.reply_count || 0;
        const engagement = votes + replies * 0.5;
        // Log of engagement boosted, divided by age decay (gravity)
        const hotScore = (Math.log10(Math.max(engagement, 1)) + 1) / Math.pow(ageHours / 6 + 1, 0.5);
        return { ...t, _hotScore: hotScore };
      });

      threads.sort((a, b) => b._hotScore - a._hotScore);
      threads = threads.slice(0, limit);

      set({ recentThreads: { items: threads, loading: false }, hotThreadsLoaded: true });
    } catch (err) {
      console.error('[forumStore] fetchHotThreads error:', err);
      set({ recentThreads: { items: [], loading: false }, hotThreadsLoaded: true });
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
  },
}));
