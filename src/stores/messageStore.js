'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from './authStore';

// Staff user IDs in display order — always shown as pre-existing chats for regular users
export const STAFF_IDS = [
  '8572637a-2109-4471-bcb4-3163d04094d0',
  'b2fb8e00-bbd0-489b-a762-945fa811861f',
  'cf5e37af-df59-44e3-a446-3f97e5e4c558',
  '5da61b1a-c487-44c1-9f1e-c7d35ca9e46b',
];

export const useMessageStore = create((set, get) => ({
  conversations: [],
  messages: [],
  unreadTotal: 0,
  loading: false,
  messagesLoading: false,
  conversationsLoaded: false,
  _realtimeChannel: null,
  _refetchTimer: null,

  fetchConversations: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const isStaff = STAFF_IDS.includes(userId);
    set({ loading: true });
    try {
      const supabase = createClient();

      // Get all DMs involving the current user
      const { data: allDms } = await supabase
        .from('direct_messages')
        .select('id, from_user_id, to_user_id, body, read, created_at')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      // Group by conversation partner
      const byPartner = {};
      for (const dm of (allDms || [])) {
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

      // For regular users: ensure all staff appear as conversations (even with no messages)
      // For staff: only show conversations where someone has actually messaged them
      const allPartnerIds = new Set(Object.keys(byPartner));
      if (!isStaff) {
        for (const staffId of STAFF_IDS) {
          if (staffId === userId) continue; // don't show yourself
          if (!allPartnerIds.has(staffId)) {
            byPartner[staffId] = {
              partnerId: staffId,
              lastMessage: null,
              unreadCount: 0,
            };
            allPartnerIds.add(staffId);
          }
        }
      }

      // Fetch partner profiles
      const partnerIds = [...allPartnerIds];
      const { data: profiles } = partnerIds.length > 0
        ? await supabase.from('profiles').select('id, display_name, avatar_url').in('id', partnerIds)
        : { data: [] };

      const profileMap = {};
      for (const p of (profiles || [])) {
        profileMap[p.id] = p;
      }

      let conversations = Object.values(byPartner)
        .map((c) => ({
          ...c,
          partner: profileMap[c.partnerId] || { id: c.partnerId, display_name: 'Unknown' },
        }));

      if (!isStaff) {
        // For regular users: sort staff in the defined order, always at top
        const staffOrder = STAFF_IDS.filter((id) => id !== userId);
        const staffConvs = [];
        const otherConvs = [];
        for (const c of conversations) {
          if (staffOrder.includes(c.partnerId)) {
            staffConvs.push(c);
          } else {
            otherConvs.push(c);
          }
        }
        staffConvs.sort((a, b) => staffOrder.indexOf(a.partnerId) - staffOrder.indexOf(b.partnerId));
        otherConvs.sort((a, b) => {
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
        });
        conversations = [...staffConvs, ...otherConvs];
      } else {
        // For staff: sort by most recent message
        conversations.sort((a, b) => {
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
        });
      }

      set({ conversations, loading: false, conversationsLoaded: true });
    } catch (err) {
      console.error('[messageStore] fetchConversations error:', err);
      set({ loading: false });
    }
  },

  fetchMessages: async (otherUserId) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId || !otherUserId) return;

    set({ messagesLoading: true });
    try {
      const supabase = createClient();

      const { data } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(from_user_id.eq.${userId},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${userId})`
        )
        .order('created_at', { ascending: true });

      set({ messages: data || [], messagesLoading: false });
    } catch (err) {
      console.error('[messageStore] fetchMessages error:', err);
      set({ messagesLoading: false });
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
          // Debounce conversation refetch — collapses rapid DM bursts into 1 fetch
          const prevTimer = get()._refetchTimer;
          if (prevTimer) clearTimeout(prevTimer);
          const timer = setTimeout(() => {
            get().fetchConversations();
          }, 2000);
          set({ _refetchTimer: timer });
        }
      )
      .subscribe();

    set({ _realtimeChannel: channel });
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
