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

  // Surface silent async failures that could cause UI freezes
  useEffect(() => {
    const handler = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  return null;
}
