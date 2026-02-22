'use client';

import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase/client';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const loading = useAuthStore((s) => s.loading);
  const signOut = useAuthStore((s) => s.signOut);
  const supabase = createClient();

  return { user, profile, loading, signOut, supabase };
}
