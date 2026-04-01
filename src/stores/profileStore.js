'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from './authStore';

export const useProfileStore = create((set, get) => ({
  profiles: {}, // keyed by userId: { data, threads, replies, loading }
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

  pruneCache: (keepUserId) => {
    const profiles = get().profiles;
    const keys = Object.keys(profiles);
    const MAX_CACHED = 10;
    if (keys.length <= MAX_CACHED) return;
    const currentUserId = useAuthStore.getState().user?.id;
    const pruned = { ...profiles };
    const toRemove = keys
      .filter((k) => k !== keepUserId && k !== currentUserId)
      .slice(0, keys.length - MAX_CACHED);
    for (const k of toRemove) delete pruned[k];
    set({ profiles: pruned });
  },

  getSnapshot: () => {
    const s = get();
    return {
      profileKeys: Object.keys(s.profiles).length,
      pendingAborts: Object.keys(s._abortControllers).length,
    };
  },

  fetchProfile: async (userId) => {
    if (!userId) return;
    const existing = get().profiles[userId];
    if (existing && !existing.loading) return; // skip only if fully loaded

    get().cancelPending('fetchProfile');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchProfile: controller },
      profiles: { ...state.profiles, [userId]: { data: null, threads: [], replies: [], loading: true } },
    }));

    const supabase = createClient();
    const currentUserId = useAuthStore.getState().user?.id;
    const isOwn = currentUserId === userId;

    const promises = [
      supabase.from('profiles').select('*').eq('id', userId).abortSignal(controller.signal).single(),
      supabase
        .from('threads')
        .select('*, forums:forum_id(name, drug_slug, slug)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal)
        .limit(20),
      supabase
        .from('replies')
        .select('*, threads:thread_id(id, title)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal)
        .limit(20),
    ];

    if (isOwn) {
      promises.push(
        supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(50)
          .abortSignal(controller.signal)
      );
    }

    try {
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
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[profileStore] fetchProfile error:', err);
      set((state) => ({
        profiles: {
          ...state.profiles,
          [userId]: { data: null, threads: [], replies: [], journal: [], loading: false },
        },
      }));
    }
  },

  updateProfile: async (partial) => {
    const supabase = createClient();
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const result = await supabase
      .from('profiles')
      .update(partial)
      .eq('id', userId);

    if (!result || result.error) {
      const msg = result?.error?.message || 'Unknown error';
      console.error('[profileStore] updateProfile error:', msg);
      throw new Error(msg);
    }

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
