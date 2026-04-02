'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useForumStore } from '@/stores/forumStore';
import { initVisibilityManager, destroyVisibilityManager } from '@/lib/visibilityManager';
import { startHeartbeat, stopHeartbeat } from '@/lib/realtimeGuard';

export default function StoreInitializer() {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    useAuthStore.getState().initialize();
    // Forums are public data — start fetching in parallel with auth (no auth needed)
    useForumStore.getState().fetchForums();

    // Initialize visibility manager for tab-switching handling
    initVisibilityManager();

    // Start WebSocket health monitoring (Safari dead-socket detection)
    startHeartbeat();

    // Initialize diagnostics if enabled
    if (process.env.NEXT_PUBLIC_DIAG_MODE === 'true') {
      import('@/lib/diagnostics/perfAudit').then((m) => m.initPerfAudit());
      import('@/lib/diagnostics/visibilityStressTest').then((m) => m.initVisibilityStressTest());
      import('@/lib/diagnostics/threadLoadTest').then((m) => m.initThreadLoadTest());
      import('@/lib/diagnostics/navigationStressTest').then((m) => m.initNavigationStressTest());
      import('@/lib/diagnostics/compatAudit').then((m) => m.runCompatAudit());
      import('@/lib/diagnostics/wsHealthMonitor').then((m) => m.startWsHealthMonitor());
    }

    return () => {
      destroyVisibilityManager();
      stopHeartbeat();
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

  // Listen for session-expired events (Safari ITP)
  useEffect(() => {
    const handler = () => setSessionExpired(true);
    window.addEventListener('taper:session-expired', handler);
    return () => window.removeEventListener('taper:session-expired', handler);
  }, []);

  const handleReLogin = useCallback(() => {
    setSessionExpired(false);
    window.location.href = '/auth/login';
  }, []);

  const handleDismiss = useCallback(() => {
    setSessionExpired(false);
  }, []);

  if (!sessionExpired) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-3 shadow-lg"
      style={{
        background: 'var(--surface-elevated, #fff)',
        borderColor: 'var(--border-subtle, #e5e7eb)',
        maxWidth: '90vw',
      }}
    >
      <p className="text-sm text-foreground">
        Your session expired — tap to sign back in.
      </p>
      <button
        onClick={handleReLogin}
        className="whitespace-nowrap rounded-lg bg-purple px-3 py-1.5 text-sm font-medium text-white"
      >
        Sign in
      </button>
      <button
        onClick={handleDismiss}
        className="rounded p-1 text-text-subtle hover:text-foreground"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
