'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useForumStore } from '@/stores/forumStore';

export default function StoreInitializer() {
  useEffect(() => {
    useAuthStore.getState().initialize();
    // Forums are public data — start fetching in parallel with auth (no auth needed)
    useForumStore.getState().fetchForums();
  }, []);

  return null;
}
