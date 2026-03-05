'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Hero from '@/components/home/Hero';
import CommunityPulse from '@/components/home/CommunityPulse';
import ForumSections from '@/components/home/ForumSections';
import PatientDashboard from '@/components/home/PatientDashboard';

const DeprescribingMap = dynamic(
  () => import('@/components/home/DeprescribingMap'),
  { ssr: false }
);

export default function HomePage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg className="h-8 w-8 animate-spin" style={{ color: 'var(--purple)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // Signed-in: hero + patient dashboard
  if (user) {
    return (
      <div className="space-y-12">
        <Hero />
        <PatientDashboard user={user} profile={profile} />
      </div>
    );
  }

  // Signed-out: hero + welcome text + marketing/landing page
  return (
    <div className="space-y-12">
      <Hero />
      <section className="mx-auto max-w-2xl text-center">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--purple)' }}>
          Peer Support Community
        </p>
        <h2 className="font-serif text-[30px] font-semibold leading-tight text-foreground sm:text-[36px]">
          You&apos;re not alone in your{' '}
          <span style={{ color: '#2EC4B6' }}>taper journey</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] font-semibold leading-relaxed text-text-muted">
          A peer support community for safely tapering psychiatric medications.
          Evidence-based guidance, shared experiences, and taper journals.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-[14px] font-semibold text-white no-underline transition hover:opacity-90"
            style={{ background: '#2EC4B6' }}
          >
            Sign Up
          </Link>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 rounded-xl border px-8 py-3 text-[14px] font-semibold no-underline transition hover:opacity-80"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)', background: 'var(--surface-strong)' }}
          >
            Sign In
          </Link>
        </div>
      </section>
      <CommunityPulse large />
      <ForumSections />
      <DeprescribingMap compact />
    </div>
  );
}
