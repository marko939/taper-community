'use client';

import Link from 'next/link';

export default function TenPercentRule() {
  return (
    <section className="glass-panel panel-border-accent p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
          style={{ background: 'var(--purple-pale)' }}
        >
          <span className="text-2xl font-bold" style={{ color: 'var(--purple)', fontFamily: 'Fraunces, Georgia, serif' }}>
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
        </div>
        <div className="flex-1">
          <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Learn About Safe Tapering</h2>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)', lineHeight: 1.65 }}>
            Water titration, bead counting, liquid formulations, and compounding — learn the
            methods that make gradual, safe dose reductions possible. Plus: how to tell
            withdrawal from relapse.
          </p>
        </div>
        <Link href="/education" className="btn btn-primary shrink-0 text-sm no-underline">
          Education
        </Link>
      </div>
    </section>
  );
}
