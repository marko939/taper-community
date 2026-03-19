'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

export default function ExitIntentPopup() {
  const user = useAuthStore((s) => s.user);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (user) return; // don't show to signed-in users

    function handleMouseLeave(e) {
      if (e.clientY > 10) return; // only trigger when mouse leaves toward top
      if (sessionStorage.getItem('tc_exit_shown')) return; // once per session

      sessionStorage.setItem('tc_exit_shown', '1');
      setShow(true);
    }

    // Delay adding listener so it doesn't trigger immediately
    const timeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [user]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => setShow(false)}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border bg-white p-8 text-center"
        style={{ borderColor: 'var(--border-subtle)', boxShadow: '0 16px 48px rgba(91,46,145,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setShow(false)}
          className="absolute right-4 top-4 rounded-full p-1 text-text-subtle hover:bg-surface-strong hover:text-foreground"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'var(--purple-ghost)', color: 'var(--purple)' }}
        >
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>

        <h3 className="font-serif text-xl font-semibold text-foreground">Before you go...</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm text-text-muted">
          Join 100+ members who are safely tapering with peer support, shared taper journals, and access to 57+ deprescribing providers.
        </p>

        {/* CTA buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/auth/signup"
            className="btn btn-primary w-full text-sm no-underline"
            onClick={() => setShow(false)}
          >
            Join for Free
          </Link>
          <a
            href="/tapering-readiness-guide.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary w-full text-sm no-underline"
            onClick={() => setShow(false)}
          >
            Download Free Taper Preparation Guide
          </a>
        </div>

        <p className="mt-4 text-xs text-text-subtle">Free forever. No credit card required.</p>
      </div>
    </div>
  );
}
