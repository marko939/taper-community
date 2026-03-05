'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from './authStore';

export const useMessageStore = create((set, get) => ({
  conversations: [],
  messages: [],
  unreadTotal: 0,
  loading: false,
  conversationsLoaded: false,
  _realtimeChannel: null,

  fetchConversations: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    set({ loading: true });
    try {
      const supabase = createClient();

      // Get all DMs involving the current user
      const { data: allDms } = await supabase
        .from('direct_messages')
        .select('id, from_user_id, to_user_id, body, read, created_at')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (!allDms || allDms.length === 0) {
        set({ conversations: [], loading: false, conversationsLoaded: true });
        return;
      }

      // Group by conversation partner
      const byPartner = {};
      for (const dm of allDms) {
        const partnerId = dm.from_user_id === userId ? dm.to_user_id : dm.from_user_id;
        if (!byPartner[partnerId]) {
          byPartner[partnerId] = {
            partnerId,
            lastMessage: dm,
            unreadCount: 0,
          };
        }
        if (dm.to_user_id === userId && !dm.read) {
          byPartner[partnerId].unreadCount++;
        }
      }

      // Fetch partner profiles
      const partnerIds = Object.keys(byPartner);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', partnerIds);

      const profileMap = {};
      for (const p of (profiles || [])) {
        profileMap[p.id] = p;
      }

      const conversations = Object.values(byPartner)
        .map((c) => ({
          ...c,
          partner: profileMap[c.partnerId] || { id: c.partnerId, display_name: 'Unknown' },
        }))
        .sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at));

      set({ conversations, loading: false, conversationsLoaded: true });
    } catch (err) {
      console.error('[messageStore] fetchConversations error:', err);
      set({ loading: false });
    }
  },

  fetchMessages: async (otherUserId) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId || !otherUserId) return;

    set({ loading: true });
    try {
      const supabase = createClient();

      const { data } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(from_user_id.eq.${userId},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${userId})`
        )
        .order('created_at', { ascending: true });

      set({ messages: data || [], loading: false });
    } catch (err) {
      console.error('[messageStore] fetchMessages error:', err);
      set({ loading: false });
    }
  },

  sendMessage: async (toUserId, body) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId || !toUserId || !body.trim()) return null;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({ from_user_id: userId, to_user_id: toUserId, body: body.trim() })
        .select()
        .single();

      if (error) throw error;

      // Append to current messages
      set((state) => ({ messages: [...state.messages, data] }));
      return data;
    } catch (err) {
      console.error('[messageStore] sendMessage error:', err);
      return null;
    }
  },

  markConversationRead: async (otherUserId) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId || !otherUserId) return;

    try {
      const supabase = createClient();
      await supabase
        .from('direct_messages')
        .update({ read: true })
        .eq('from_user_id', otherUserId)
        .eq('to_user_id', userId)
        .eq('read', false);

      // Update local state
      set((state) => ({
        messages: state.messages.map((m) =>
          m.from_user_id === otherUserId && m.to_user_id === userId ? { ...m, read: true } : m
        ),
        conversations: state.conversations.map((c) =>
          c.partnerId === otherUserId ? { ...c, unreadCount: 0 } : c
        ),
      }));

      // Recalculate total
      set((state) => ({
        unreadTotal: state.conversations.reduce((sum, c) => sum + c.unreadCount, 0),
      }));
    } catch (err) {
      console.error('[messageStore] markConversationRead error:', err);
    }
  },

  fetchUnreadTotal: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      const supabase = createClient();
      const { count } = await supabase
        .from('direct_messages')
        .select('id', { count: 'exact', head: true })
        .eq('to_user_id', userId)
        .eq('read', false);

      set({ unreadTotal: count || 0 });
    } catch (err) {
      console.error('[messageStore] fetchUnreadTotal error:', err);
    }
  },

  subscribeRealtime: () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const existing = get()._realtimeChannel;
    if (existing) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`dms:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `to_user_id=eq.${userId}`,
        },
        (payload) => {
          set((state) => ({
            unreadTotal: state.unreadTotal + 1,
            messages: [...state.messages, payload.new],
          }));
          // Refresh conversations to update the list
          get().fetchConversations();
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
