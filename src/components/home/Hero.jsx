'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

function useTotalReduced() {
  const [total, setTotal] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('journal_entries')
        .select('user_id, drug, dose_numeric, date')
        .not('dose_numeric', 'is', null)
        .order('date', { ascending: true });

      if (!data) return;
      const byUserDrug = {};
      data.forEach((e) => {
        if (!e.drug || e.dose_numeric == null) return;
        const key = `${e.user_id}::${e.drug}`;
        if (!byUserDrug[key]) byUserDrug[key] = { first: e.dose_numeric, latest: e.dose_numeric };
        byUserDrug[key].latest = e.dose_numeric;
      });
      let reduced = 0;
      Object.values(byUserDrug).forEach(({ first, latest }) => {
        if (first > latest) reduced += first - latest;
      });
      setTotal(Math.round(reduced * 10) / 10);
    };
    fetch();
  }, []);

  return total;
}

export default function Hero() {
  const totalReduced = useTotalReduced();

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

      <div className="relative z-10 px-6 py-20 sm:px-12 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-white/50">
            Peer Support Community
          </p>
          <h1 className="font-serif text-[30px] font-semibold leading-tight text-white sm:text-[36px]">
            You&apos;re not alone in your{' '}
            <span style={{ color: '#2EC4B6' }}>taper journey</span>
          </h1>

          {/* Meds reduced counter */}
          {totalReduced !== null && totalReduced > 0 && (
            <div className="mx-auto mt-6 flex flex-col items-center gap-1">
              <p className="text-[42px] font-bold leading-none sm:text-[56px]" style={{ color: '#2EC4B6' }}>
                {totalReduced.toLocaleString()} mg
              </p>
              <p className="text-[13px] font-medium tracking-wide text-white/60">
                of psychiatric medications tapered on this platform
              </p>
            </div>
          )}

          <p className="mx-auto mt-6 max-w-xl text-[15px] font-semibold leading-relaxed text-white/80">
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
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-8 py-3 text-[14px] font-semibold text-white/80 no-underline transition hover:border-white/30 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
