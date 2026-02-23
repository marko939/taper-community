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

    // Query threads through junction table (one thread, many forums)
    const { data, count } = await supabase
      .from('threads')
      .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, drug_signature, avatar_url), thread_forums!inner(forum_id)', { count: 'exact' })
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
      .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, drug_signature, avatar_url), thread_forums!inner(forum_id)', { count: 'exact' })
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

  fetchTopThreads: async (limit = 10) => {
    try {
      const supabase = createClient();

      const { data } = await supabase
        .from('threads')
        .select('*, profiles:user_id(display_name, is_peer_advisor, avatar_url), forums:forum_id(name, drug_slug, slug)')
        .order('vote_score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      set({ recentThreads: { items: data || [], loading: false } });
    } catch (err) {
      console.error('[forumStore] fetchTopThreads error:', err);
      set({ recentThreads: { items: [], loading: false } });
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
      ? '*, profiles:user_id(display_name, is_peer_advisor, avatar_url), forums:forum_id(name, slug, drug_slug), thread_forums!inner(forum_id)'
      : '*, profiles:user_id(display_name, is_peer_advisor, avatar_url), forums:forum_id(name, slug, drug_slug)';

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
