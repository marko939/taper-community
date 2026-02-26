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
        // Use getSession() (reads local cookie, near-instant) instead of getUser() (network roundtrip)
        // onAuthStateChange listener below handles stale session correction
        const sessionResult = await supabase.auth.getSession();
        const user = sessionResult?.data?.session?.user ?? null;
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
      const authChangeResult = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN') {
            const newUser = session?.user ?? null;
            if (newUser) {
              const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', newUser.id)
                .single();
              set({ user: newUser, profile: data });
            }
          } else if (event === 'TOKEN_REFRESHED') {
            // Keep user object in sync with refreshed token —
            // prevents stale auth state after token rotation
            const newUser = session?.user ?? null;
            if (newUser) {
              set({ user: newUser });
            }
          } else if (event === 'SIGNED_OUT') {
            set({ user: null, profile: null });
          }
        }
      );
      const subscription = authChangeResult?.data?.subscription;

      // Store cleanup function (rarely needed for app-lifetime store)
      return () => subscription?.unsubscribe();
    } catch (err) {
      console.error('[authStore] onAuthStateChange error:', err);
    }
  },

  signOut: async () => {
    set({ user: null, profile: null });
    try {
      const supabase = createClient();
      // Don't block on signOut — clear state and redirect immediately
      supabase.auth.signOut().catch(() => {});
    } catch {
      // Ignore — state is already cleared
    }
  },

  updateProfileCache: (partial) => {
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...partial } : null,
    }));
  },
}));
