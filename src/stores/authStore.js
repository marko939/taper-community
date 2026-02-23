'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: () => {
    if (get().initialized) return;
    set({ initialized: true });

    let supabase;
    try {
      supabase = createClient();
    } catch (err) {
      console.error('[authStore] createClient failed:', err);
      set({ loading: false });
      return;
    }

    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          set({ user, profile: data, loading: false });
        } else {
          set({ loading: false });
        }
      } catch (err) {
        console.error('[authStore] init error:', err);
        set({ loading: false });
      }
    };

    init();

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          const newUser = session?.user ?? null;
          if (newUser) {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newUser.id)
              .single();
            set({ user: newUser, profile: data });
          } else {
            set({ user: null, profile: null });
          }
        }
      );

      // Store cleanup function (rarely needed for app-lifetime store)
      return () => subscription.unsubscribe();
    } catch (err) {
      console.error('[authStore] onAuthStateChange error:', err);
    }
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  updateProfileCache: (partial) => {
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...partial } : null,
    }));
  },
}));
