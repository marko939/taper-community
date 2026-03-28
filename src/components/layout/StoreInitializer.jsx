'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useForumStore } from '@/stores/forumStore';
import { initVisibilityManager, destroyVisibilityManager } from '@/lib/visibilityManager';

export default function StoreInitializer() {
  useEffect(() => {
    useAuthStore.getState().initialize();
    // Forums are public data — start fetching in parallel with auth (no auth needed)
    useForumStore.getState().fetchForums();

    // Initialize visibility manager for tab-switching handling
    initVisibilityManager();

    // Initialize diagnostics if enabled
    if (process.env.NEXT_PUBLIC_DIAG_MODE === 'true') {
      import('@/lib/diagnostics/perfAudit').then((m) => m.initPerfAudit());
      import('@/lib/diagnostics/visibilityStressTest').then((m) => m.initVisibilityStressTest());
      import('@/lib/diagnostics/threadLoadTest').then((m) => m.initThreadLoadTest());
    }

    return () => {
      destroyVisibilityManager();
    };
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
