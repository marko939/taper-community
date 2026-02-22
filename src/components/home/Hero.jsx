'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[24px]" style={{
      boxShadow: '0 12px 48px rgba(91, 46, 145, 0.25), 0 4px 16px rgba(0,0,0,0.1)',
    }}>
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/hero-bg.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Dark overlay for text readability */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'rgba(42,18,80,0.35)' }} />

      <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-white/50">
            Peer Support Community
          </p>
          <h1 className="font-serif text-[30px] font-semibold leading-tight text-white sm:text-[36px]">
            You&apos;re not alone in your{' '}
            <span style={{ color: '#2EC4B6' }}>taper journey</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] font-semibold leading-relaxed text-white/80">
            A peer support community for safely tapering psychiatric medications.
            Evidence-based guidance, shared experiences, and taper journals.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/forums"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-[14px] font-semibold text-white no-underline transition hover:opacity-90"
              style={{ background: '#2EC4B6' }}
            >
              Browse Forums
            </Link>
            <a
              href="https://tapermeds.com/education"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-8 py-3 text-[14px] font-semibold text-white/80 no-underline transition hover:border-white/30 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
            >
              Education
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
