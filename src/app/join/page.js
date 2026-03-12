'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import CommunityPulse from '@/components/home/CommunityPulse';

function JoinContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const signupHref = ref ? `/auth/signup?ref=${encodeURIComponent(ref)}` : '/auth/signup';

  const benefits = [
    {
      title: 'Drug-Specific Forums',
      desc: 'Dedicated forums for SSRIs, SNRIs, benzos, antipsychotics, and more. Find people tapering the same medication as you.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      ),
    },
    {
      title: 'Hyperbolic Taper Tracker',
      desc: 'Log doses, symptoms, and mood daily. Track your taper with tools built around the Maudsley Guidelines.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      title: 'Deprescriber Directory',
      desc: 'Find tapering-friendly clinicians near you. 57+ providers across 6 countries who understand gradual withdrawal.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-[24px]"
        style={{ boxShadow: '0 12px 48px rgba(91, 46, 145, 0.25), 0 4px 16px rgba(0,0,0,0.1)' }}
      >
        <div className="absolute inset-0">
          <Image src="/images/hero-banner.png" alt="TaperCommunity peer support for medication tapering" fill className="object-cover" />
        </div>
        <div className="pointer-events-none absolute inset-0" style={{ background: 'rgba(42,18,80,0.55)' }} />
        <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-white/50">
              Peer Support Community
            </p>
            <h1 className="font-serif text-[30px] font-semibold leading-tight text-white sm:text-[36px]">
              Join the fastest-growing{' '}
              <span style={{ color: '#2EC4B6' }}>tapering support community</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] font-semibold leading-relaxed text-white/80">
              Evidence-based guidance, peer support, and taper journals — all free, forever.
              Connect with others who understand your journey.
            </p>
            <div className="mt-8">
              <Link
                href={signupHref}
                className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-[14px] font-semibold text-white no-underline transition hover:opacity-90"
                style={{ background: '#2EC4B6' }}
              >
                Create Free Account
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            <p className="mt-5 text-[12px] font-medium tracking-wide text-white/40">
              100+ members in our first 10 days — and growing fast
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            Everything you need to{' '}
            <span style={{ color: 'var(--purple)' }}>taper safely</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-text-muted">
            Built from the ground up with modern tools, evidence-based resources, and a mission to help people taper safely.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border p-6 transition hover:border-purple hover:shadow-elevated"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
              >
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            What our members{' '}
            <span style={{ color: 'var(--purple)' }}>say</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
          >
            <svg className="mb-3 h-6 w-6" style={{ color: 'var(--purple)' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.983 5.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
            </svg>
            <p className="text-sm leading-relaxed text-text-muted">
              After years on Surviving Antidepressants and BenzoBuddies, TaperCommunity is the first place that actually felt like home. The taper tracker and symptom logging are tools I didn&apos;t know I needed — they changed everything about how I approach my taper. I believed in it so much that I joined as a community support member to help it grow.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: 'var(--purple)' }}
              >
                C
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Catina</p>
                <p className="text-xs text-text-subtle">Community Support Member</p>
              </div>
            </div>
          </div>
          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
          >
            <svg className="mb-3 h-6 w-6" style={{ color: 'var(--purple)' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.983 5.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
            </svg>
            <p className="text-sm leading-relaxed text-text-muted">
              Being able to track my symptoms and share daily check-ins has made all the difference. I actually look forward to logging in each day — the community keeps me accountable and reminds me I&apos;m not doing this alone. For the first time, I feel in control of my taper.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: '#2EC4B6' }}
              >
                S
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">STVE</p>
                <p className="text-xs text-text-subtle">Member</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community stats */}
      <CommunityPulse large />

      {/* Bottom CTA */}
      <section className="text-center">
        <h2 className="font-serif text-xl font-semibold text-foreground sm:text-2xl">
          Ready to start your taper journey?
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-text-muted">
          Join a community of people who understand what you&apos;re going through. Always free, always supportive.
        </p>
        <div className="mt-6">
          <Link
            href={signupHref}
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-white no-underline transition hover:opacity-90"
            style={{ background: 'var(--purple)' }}
          >
            Join Free
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
