'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from './authStore';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  _realtimeChannel: null,

  fetchNotifications: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    set({ loading: true });
    const supabase = createClient();

    const { data } = await supabase
      .from('notifications')
      .select('*, actor:actor_id(display_name, avatar_url), thread:thread_id(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    set({ notifications: data || [], loading: false });
  },

  fetchUnreadCount: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const supabase = createClient();

    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    set({ unreadCount: count || 0 });
  },

  markAsRead: async (id) => {
    const supabase = createClient();

    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
  },

  markAllAsRead: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const supabase = createClient();

    set((state) => ({
      unreadCount: 0,
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
  },

  subscribeRealtime: () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const existing = get()._realtimeChannel;
    if (existing) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          set((state) => ({
            notifications: [payload.new, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));
        }
      )
      .subscribe();

    set({ _realtimeChannel: channel });
  },

  unsubscribeRealtime: () => {
    const channel = get()._realtimeChannel;
    if (channel) {
      const supabase = createClient();
      supabase.removeChannel(channel);
      set({ _realtimeChannel: null });
    }
  },
}));
