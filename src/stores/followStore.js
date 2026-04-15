'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { PROFILE_FIELDS_COMPACT, THREAD_FORUM_RELATION } from '@/lib/supabase/queries';

const ADMIN_ID = '8572637a-2109-4471-bcb4-3163d04094d0';

// Request ID counter — used to ignore stale responses from concurrent fetches
let _followedThreadsRequestId = 0;

export const useFollowStore = create((set, get) => ({
  following: new Set(),
  followingLoaded: false,
  followCounts: {},
  followedThreads: { items: [], loading: true },
  followedThreadsLoaded: false,
  followedForums: new Set(),
  followedForumsLoaded: false,
  threadFollows: new Set(),
  threadFollowsLoaded: false,
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

  invalidateFeeds: () => {
    set({ followedThreadsLoaded: false });
  },

  fetchFollowing: async (userId) => {
    if (!userId || get().followingLoaded) return;

    get().cancelPending('fetchFollowing');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchFollowing: controller },
    }));

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('user_follows')
        .select('followed_id')
        .eq('follower_id', userId)
        .abortSignal(controller.signal);

      const ids = new Set((data || []).map((r) => r.followed_id));
      set({ following: ids, followingLoaded: true });
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[followStore] fetchFollowing error:', err);
      set({ followingLoaded: true });
    }
  },

  fetchFollowCounts: async (userId) => {
    if (!userId) return;

    get().cancelPending('fetchFollowCounts');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchFollowCounts: controller },
    }));

    try {
      const supabase = createClient();
      const [followersRes, followingRes] = await Promise.all([
        supabase.from('user_follows').select('follower_id', { count: 'exact', head: true }).eq('followed_id', userId).abortSignal(controller.signal),
        supabase.from('user_follows').select('followed_id', { count: 'exact', head: true }).eq('follower_id', userId).abortSignal(controller.signal),
      ]);

      set((state) => ({
        followCounts: {
          ...state.followCounts,
          [userId]: {
            followers: followersRes.count ?? 0,
            following: followingRes.count ?? 0,
          },
        },
      }));
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[followStore] fetchFollowCounts error:', err);
    }
  },

  fetchFollowedThreads: async ({ force = false } = {}) => {
    if (!force && get().followedThreadsLoaded) return;
    const requestId = ++_followedThreadsRequestId;
    const { following } = get();
    if (following.size === 0) {
      set({ followedThreads: { items: [], loading: false }, followedThreadsLoaded: true });
      return;
    }

    get().cancelPending('fetchFollowedThreads');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchFollowedThreads: controller },
    }));
    set({ followedThreads: { items: get().followedThreads.items, loading: true } });

    try {
      const supabase = createClient();
      const followedIds = Array.from(following);

      const { data } = await supabase
        .from('threads')
        .select(`*, ${PROFILE_FIELDS_COMPACT}, ${THREAD_FORUM_RELATION}`)
        .in('user_id', followedIds)
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal)
        .limit(20);

      // Stale response — a newer request was fired, ignore this one
      if (requestId !== _followedThreadsRequestId) return;

      let threads = data || [];

      // Apply hot scoring (same as forumStore)
      const now = Date.now();
      threads = threads.map((t) => {
        const ageHours = Math.max((now - new Date(t.created_at).getTime()) / 3600000, 0.1);
        const votes = Math.max(t.vote_score || 0, 0);
        const replies = t.reply_count || 0;
        const engagement = votes + replies * 0.5;
        const hotScore = (Math.log10(Math.max(engagement, 1)) + 1) / Math.pow(ageHours / 6 + 1, 0.5);
        return { ...t, _hotScore: hotScore };
      });

      threads.sort((a, b) => b._hotScore - a._hotScore);
      threads = threads.slice(0, 4);

      set({ followedThreads: { items: threads, loading: false }, followedThreadsLoaded: true });
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (requestId !== _followedThreadsRequestId) return;
      console.error('[followStore] fetchFollowedThreads error:', err);
      set({ followedThreads: { items: [], loading: false }, followedThreadsLoaded: true });
    }
  },

  toggleFollow: async (currentUserId, targetUserId) => {
    const { following } = get();
    const isCurrentlyFollowing = following.has(targetUserId);
    const supabase = createClient();

    // Optimistic update
    const newFollowing = new Set(following);
    if (isCurrentlyFollowing) {
      newFollowing.delete(targetUserId);
    } else {
      newFollowing.add(targetUserId);
    }
    set({ following: newFollowing });

    // Update follow counts optimistically
    set((state) => {
      const counts = state.followCounts[targetUserId];
      if (!counts) return state;
      return {
        followCounts: {
          ...state.followCounts,
          [targetUserId]: {
            ...counts,
            followers: counts.followers + (isCurrentlyFollowing ? -1 : 1),
          },
        },
      };
    });

    try {
      if (isCurrentlyFollowing) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('followed_id', targetUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_follows')
          .insert({ follower_id: currentUserId, followed_id: targetUserId });
        if (error) throw error;
      }
    } catch (err) {
      console.error('[followStore] toggleFollow error:', err);
      // Revert on error
      set({ following });
      get().fetchFollowCounts(targetUserId);
    }
  },

  isFollowing: (userId) => get().following.has(userId),

  // ── Forum follows ──────────────────────────────────────────

  fetchFollowedForums: async (userId) => {
    if (!userId || get().followedForumsLoaded) return;

    get().cancelPending('fetchFollowedForums');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchFollowedForums: controller },
    }));

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('forum_follows')
        .select('forum_id')
        .eq('follower_id', userId)
        .abortSignal(controller.signal);

      const ids = new Set((data || []).map((r) => r.forum_id));
      set({ followedForums: ids, followedForumsLoaded: true });
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[followStore] fetchFollowedForums error:', err);
      set({ followedForumsLoaded: true });
    }
  },

  toggleForumFollow: async (currentUserId, forumId) => {
    const { followedForums } = get();
    const isCurrentlyFollowing = followedForums.has(forumId);
    const supabase = createClient();

    // Optimistic update
    const newFollowedForums = new Set(followedForums);
    if (isCurrentlyFollowing) {
      newFollowedForums.delete(forumId);
    } else {
      newFollowedForums.add(forumId);
    }
    set({ followedForums: newFollowedForums });

    try {
      if (isCurrentlyFollowing) {
        const { error } = await supabase
          .from('forum_follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('forum_id', forumId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('forum_follows')
          .insert({ follower_id: currentUserId, forum_id: forumId });
        if (error) throw error;
      }
    } catch (err) {
      console.error('[followStore] toggleForumFollow error:', err);
      set({ followedForums }); // revert
    }
  },

  isFollowingForum: (forumId) => get().followedForums.has(forumId),

  // ── Thread follows ──────────────────────────────────────────

  fetchThreadFollows: async (userId) => {
    if (!userId || get().threadFollowsLoaded) return;

    get().cancelPending('fetchThreadFollows');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchThreadFollows: controller },
    }));

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('thread_follows')
        .select('thread_id')
        .eq('user_id', userId)
        .abortSignal(controller.signal);

      const ids = new Set((data || []).map((r) => r.thread_id));
      set({ threadFollows: ids, threadFollowsLoaded: true });
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[followStore] fetchThreadFollows error:', err);
      set({ threadFollowsLoaded: true });
    }
  },

  toggleThreadFollow: async (userId, threadId) => {
    const { threadFollows } = get();
    const isCurrentlyFollowing = threadFollows.has(threadId);
    const supabase = createClient();

    // Optimistic update
    const newThreadFollows = new Set(threadFollows);
    if (isCurrentlyFollowing) {
      newThreadFollows.delete(threadId);
    } else {
      newThreadFollows.add(threadId);
    }
    set({ threadFollows: newThreadFollows });

    try {
      if (isCurrentlyFollowing) {
        const { error } = await supabase
          .from('thread_follows')
          .delete()
          .eq('user_id', userId)
          .eq('thread_id', threadId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('thread_follows')
          .insert({ user_id: userId, thread_id: threadId });
        if (error) throw error;
      }
    } catch (err) {
      console.error('[followStore] toggleThreadFollow error:', err);
      set({ threadFollows }); // revert
    }
  },

  isFollowingThread: (threadId) => get().threadFollows.has(threadId),
}));
