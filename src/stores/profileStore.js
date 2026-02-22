'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from './authStore';

export const useProfileStore = create((set, get) => ({
  profiles: {}, // keyed by userId: { data, threads, replies, loading }

  fetchProfile: async (userId) => {
    if (!userId) return;
    if (get().profiles[userId]) return;

    set((state) => ({
      profiles: { ...state.profiles, [userId]: { data: null, threads: [], replies: [], loading: true } },
    }));

    const supabase = createClient();
    const currentUserId = useAuthStore.getState().user?.id;
    const isOwn = currentUserId === userId;

    const promises = [
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase
        .from('threads')
        .select('*, forums:forum_id(name, drug_slug, slug)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('replies')
        .select('*, threads:thread_id(id, title)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
    ];

    if (isOwn) {
      promises.push(
        supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
      );
    }

    const results = await Promise.all(promises);

    set((state) => ({
      profiles: {
        ...state.profiles,
        [userId]: {
          data: results[0].data,
          threads: results[1].data || [],
          replies: results[2].data || [],
          journal: isOwn && results[3] ? results[3].data || [] : [],
          loading: false,
        },
      },
    }));
  },

  updateProfile: async (partial) => {
    const supabase = createClient();
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    await supabase
      .from('profiles')
      .update(partial)
      .eq('id', userId);

    // Update local profile cache
    set((state) => {
      const existing = state.profiles[userId];
      return {
        profiles: {
          ...state.profiles,
          [userId]: existing
            ? { ...existing, data: existing.data ? { ...existing.data, ...partial } : null }
            : undefined,
        },
      };
    });

    // Also update auth store's profile cache
    useAuthStore.getState().updateProfileCache(partial);
  },
}));
