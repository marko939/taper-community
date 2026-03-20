'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function BraveBanner() {
  const [show, setShow] = useState(false);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    // Only check once auth has finished loading and user is NOT signed in
    if (loading || user) return;

    let cancelled = false;
    (async () => {
      try {
        const isBrave = await navigator.brave?.isBrave?.();
        if (isBrave && !cancelled) {
          // Only show if user hasn't dismissed before this session
          const dismissed = sessionStorage.getItem('brave_banner_dismissed');
          if (!dismissed) setShow(true);
        }
      } catch {
        // Not Brave — do nothing
      }
    })();

    return () => { cancelled = true; };
  }, [loading, user]);

  if (!show) return null;

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem('brave_banner_dismissed', '1');
  };

  return (
    <div
      className="mx-auto flex max-w-3xl items-start gap-3 rounded-xl border px-4 py-3 text-sm"
      style={{
        background: 'var(--surface-glass)',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-muted)',
        margin: '12px 16px',
      }}
    >
      <div className="flex-1">
        <p className="font-medium text-foreground">Using Brave browser?</p>
        <p className="mt-1">
          Brave&apos;s Shields may block sign-in or some features. If you experience issues,
          try clicking the Shields icon in the address bar and selecting &ldquo;Allow all cookies&rdquo; for this site.
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="mt-0.5 flex-shrink-0 rounded p-1 text-text-subtle transition hover:text-foreground"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
