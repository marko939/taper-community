'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from './authStore';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchError: false,
  _realtimeChannel: null,
  _refetchTimer: null,
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

  fetchNotifications: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    get().cancelPending('fetchNotifications');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchNotifications: controller },
      loading: true,
      fetchError: false,
    }));

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('notifications')
        .select('*, actor:actor_id(display_name, avatar_url), thread:thread_id(title), reply_id')
        .eq('user_id', userId)
        .in('type', ['thread_reply', 'reply_mention', 'badge', 'forum_new_thread'])
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal)
        .limit(50);

      if (error) throw error;
      set({ notifications: data || [], loading: false, fetchError: false });
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[notificationStore] fetchNotifications error:', err);
      set({ loading: false, fetchError: true });
    }
  },

  fetchUnreadCount: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    get().cancelPending('fetchUnreadCount');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchUnreadCount: controller },
    }));

    try {
      const supabase = createClient();

      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)
        .in('type', ['thread_reply', 'reply_mention', 'badge', 'forum_new_thread'])
        .abortSignal(controller.signal);

      set({ unreadCount: count || 0 });
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[notificationStore] fetchUnreadCount error:', err);
    }
  },

  markAsRead: async (id) => {
    const prev = get().notifications;
    const prevCount = get().unreadCount;

    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('[notificationStore] markAsRead error:', err);
      set({ notifications: prev, unreadCount: prevCount });
    }
  },

  markAllAsRead: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const prev = get().notifications;
    const prevCount = get().unreadCount;

    set((state) => ({
      unreadCount: 0,
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
      if (error) throw error;
    } catch (err) {
      console.error('[notificationStore] markAllAsRead error:', err);
      set({ notifications: prev, unreadCount: prevCount });
    }
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
          // Bump unread count immediately for the badge
          set((state) => ({
            unreadCount: state.unreadCount + 1,
          }));

          // Debounce the full list re-fetch — collapses rapid INSERT bursts
          // into a single fetch 2s after the last event
          if (get().notifications.length > 0) {
            const prevTimer = get()._refetchTimer;
            if (prevTimer) clearTimeout(prevTimer);
            const timer = setTimeout(() => {
              get().fetchNotifications();
            }, 2000);
            set({ _refetchTimer: timer });
          }
        }
      )
      .subscribe();

    set({ _realtimeChannel: channel });
  },

  createBadgeNotification: async (milestone) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      const supabase = createClient();
      const title = `${milestone.emoji} Badge earned: ${milestone.label}`;

      const { data } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'badge',
          title,
          actor_id: userId,
          thread_id: null,
          reply_id: null,
        })
        .select()
        .single();

      if (data) {
        set((state) => ({
          notifications: [data, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      }
    } catch (err) {
      // Badge notifications are non-critical — don't crash the app
      console.error('[notificationStore] createBadgeNotification error:', err);
    }
  },

  unsubscribeRealtime: () => {
    const timer = get()._refetchTimer;
    if (timer) clearTimeout(timer);

    const channel = get()._realtimeChannel;
    if (channel) {
      const supabase = createClient();
      supabase.removeChannel(channel);
      set({ _realtimeChannel: null, _refetchTimer: null });
    }
  },
}));
