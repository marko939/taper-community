'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white/60" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Disclaimer */}
        <div className="mb-8 rounded-[var(--radius-md)] border p-4" style={{ borderColor: 'rgba(232, 168, 56, 0.3)', background: 'rgba(253, 243, 224, 0.5)' }}>
          <p className="text-xs leading-relaxed" style={{ color: '#8B6914' }}>
            <strong style={{ color: '#7A5A10' }}>Medical Disclaimer:</strong> TaperCommunity is a peer support platform.
            Content shared here is based on personal experiences and should not replace professional medical advice.
            Never adjust your medication without consulting a qualified healthcare provider.
            Withdrawal from psychiatric medication can be dangerous — always taper under medical supervision.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-6 w-6 items-center justify-center rounded text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #5B2E91, #7B4FAF)' }}
              >
                T
              </div>
              <span className="text-lg font-semibold" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>TaperCommunity</span>
            </div>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Peer support for safely tapering psychiatric medications.
              Continuing the legacy of SurvivingAntidepressants.org.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Community</h4>
            <div className="flex flex-col gap-2">
              <Link href="/forums" className="text-sm no-underline transition hover:text-purple" style={{ color: 'var(--text-muted)' }}>Forums</Link>
              <Link href="/education" className="text-sm no-underline transition hover:text-purple" style={{ color: 'var(--text-muted)' }}>Education</Link>
              <Link href="/journal" className="text-sm no-underline transition hover:text-purple" style={{ color: 'var(--text-muted)' }}>Taper Journal</Link>
              <Link href="/drugs/lexapro" className="text-sm no-underline transition hover:text-purple" style={{ color: 'var(--text-muted)' }}>Drug Profiles</Link>
              <Link href="/about" className="text-sm no-underline transition hover:text-purple" style={{ color: 'var(--text-muted)' }}>About</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Resources</h4>
            <div className="flex flex-col gap-2">
              <a
                href="/deprescribers"
                className="text-sm no-underline transition hover:text-purple"
                style={{ color: 'var(--text-muted)' }}
              >
                Find a Deprescriber
              </a>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Crisis? Call 988 Suicide & Crisis Lifeline
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-4 text-center text-xs" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-subtle)' }}>
          &copy; {new Date().getFullYear()} TaperCommunity. Built with care for the tapering community.
        </div>
      </div>
    </footer>
  );
}
