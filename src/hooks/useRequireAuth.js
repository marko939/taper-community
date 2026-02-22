'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export function useRequireAuth() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const loading = useAuthStore((s) => s.loading);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  return { user, profile, loading };
}
