'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function GuideDownloadModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('submitting');
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('guide_downloads')
        .insert({ email: email.trim().toLowerCase() });

      if (error && error.code !== '23505') {
        // 23505 = unique violation (already downloaded) — still let them download
        console.error('Guide download log error:', error);
      }

      setStatus('success');
      // Trigger download
      window.open('/tapering-readiness-guide.pdf', '_blank');
    } catch {
      // Still allow download even if logging fails
      setStatus('success');
      window.open('/tapering-readiness-guide.pdf', '_blank');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border bg-white p-8 text-center"
        style={{ borderColor: 'var(--border-subtle)', boxShadow: '0 16px 48px rgba(91,46,145,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>

        {status === 'success' ? (
          <>
            <h3 className="font-serif text-xl font-semibold text-foreground">Your guide is downloading!</h3>
            <p className="mx-auto mt-3 max-w-sm text-sm text-text-muted">
              Check your downloads folder. If it didn't start automatically,{' '}
              <a
                href="/tapering-readiness-guide.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold"
                style={{ color: 'var(--purple)' }}
              >
                click here to download
              </a>.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--purple), var(--purple-light))' }}
            >
              Close
            </button>
          </>
        ) : (
          <>
            <h3 className="font-serif text-xl font-semibold text-foreground">Taper Preparation Guide</h3>
            <p className="mx-auto mt-3 max-w-sm text-sm text-text-muted">
              A 12-page readiness self-assessment with 20 questions for your clinician, plus evidence-based tapering principles.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full rounded-xl border px-4 py-3 text-sm text-foreground placeholder:text-text-subtle focus:border-purple focus:outline-none focus:ring-2 focus:ring-purple/20"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, var(--purple), var(--purple-light))' }}
              >
                {status === 'submitting' ? 'Downloading...' : 'Download Free Guide'}
              </button>
            </form>

            <p className="mt-4 text-xs text-text-subtle">We respect your privacy. No spam, ever.</p>
          </>
        )}
      </div>
    </div>
  );
}
