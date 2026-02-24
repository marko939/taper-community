'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

const ADMIN_ID = '8572637a-2109-4471-bcb4-3163d04094d0';

export const useFollowStore = create((set, get) => ({
  following: new Set(),
  followingLoaded: false,
  followCounts: {},
  followedThreads: { items: [], loading: true },

  fetchFollowing: async (userId) => {
    if (!userId || get().followingLoaded) return;

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('user_follows')
        .select('followed_id')
        .eq('follower_id', userId);

      const ids = new Set((data || []).map((r) => r.followed_id));
      set({ following: ids, followingLoaded: true });
    } catch (err) {
      console.error('[followStore] fetchFollowing error:', err);
      set({ followingLoaded: true });
    }
  },

  fetchFollowCounts: async (userId) => {
    if (!userId) return;
    try {
      const supabase = createClient();
      const [followersRes, followingRes] = await Promise.all([
        supabase.from('user_follows').select('follower_id', { count: 'exact', head: true }).eq('followed_id', userId),
        supabase.from('user_follows').select('followed_id', { count: 'exact', head: true }).eq('follower_id', userId),
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
      console.error('[followStore] fetchFollowCounts error:', err);
    }
  },

  fetchFollowedThreads: async () => {
    const { following } = get();
    if (following.size === 0) {
      set({ followedThreads: { items: [], loading: false } });
      return;
    }

    try {
      const supabase = createClient();
      const followedIds = Array.from(following);

      const { data } = await supabase
        .from('threads')
        .select('*, profiles:user_id(display_name, is_peer_advisor, avatar_url, is_founding_member), forums:forum_id(name, slug, drug_slug), thread_forums(forum_id, forums:forum_id(name, slug, drug_slug))')
        .in('user_id', followedIds)
        .order('created_at', { ascending: false })
        .limit(20);

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

      set({ followedThreads: { items: threads, loading: false } });
    } catch (err) {
      console.error('[followStore] fetchFollowedThreads error:', err);
      set({ followedThreads: { items: [], loading: false } });
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
}));
