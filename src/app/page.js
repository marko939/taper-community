'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import Hero from '@/components/home/Hero';
import CommunityPulse from '@/components/home/CommunityPulse';
import ForumSections from '@/components/home/ForumSections';
import PatientDashboard from '@/components/home/PatientDashboard';
import InvitePrompt from '@/components/journal/InvitePrompt';
import ExitIntentPopup from '@/components/shared/ExitIntentPopup';

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
        <InvitePrompt trigger="habit" userId={user.id} />
      </div>
    );
  }

  // Signed-out: welcome text + marketing/landing page
  return (
    <div className="space-y-12">
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
            <h2 className="font-serif text-[30px] font-semibold leading-tight text-white sm:text-[36px]">
              You&apos;re not alone in your{' '}
              <span style={{ color: '#2EC4B6' }}>taper journey</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] font-semibold leading-relaxed text-white/80">
              A peer support community for safely tapering psychiatric medications.
              Evidence-based guidance, shared experiences, and taper journals.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-[14px] font-semibold text-white no-underline transition hover:opacity-90"
                style={{ background: '#2EC4B6' }}
              >
                Join Free
              </Link>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-8 py-3 text-[14px] font-semibold text-white/80 no-underline transition hover:border-white/30 hover:text-white"
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
              >
                Sign In
              </Link>
            </div>
            <p className="mt-5 text-[12px] font-medium tracking-wide text-white/40">
              The fastest-growing tapering support community — 100+ members in our first 10 days
            </p>
          </div>
        </div>
      </section>

      {/* Why TaperCommunity — competitor-aware positioning */}
      <section className="space-y-8">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--purple)' }}>
            Why TaperCommunity
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            Built for the tapering community,{' '}
            <span style={{ color: 'var(--purple)' }}>by the tapering community</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-text-muted">
            Built from the ground up with modern tools, evidence-based resources, and a mission to help people taper safely.
          </p>
        </div>

        {(() => {
          const allCards = [
            {
              title: 'Hyperbolic Taper Tracker',
              desc: 'Log doses, symptoms, and mood daily. Track your taper with tools built around the Maudsley Guidelines — not generic health apps.',
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              ),
            },
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
              title: 'Deprescriber Directory',
              desc: 'Find tapering-friendly clinicians near you. 57+ providers across 6 countries who understand gradual withdrawal.',
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              ),
            },
            {
              title: 'Evidence-Based Education',
              desc: 'A full deprescribing curriculum covering neuroadaptation, hyperbolic tapering, and drug-specific protocols.',
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              ),
            },
            {
              title: 'Always Free to Use',
              desc: 'All community features — forums, taper journals, drug profiles, and peer support — are always free. No paywalls on the help you need.',
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              ),
            },
          ];
          const topRow = allCards.slice(0, 3);
          const bottomRow = allCards.slice(3);
          const Card = ({ item }) => (
            <div
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
          );
          return (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topRow.map((item, i) => <Card key={i} item={item} />)}
              </div>
              <div className="flex justify-center gap-4">
                {bottomRow.map((item, i) => (
                  <div key={i} className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.5rem)]">
                    <Card item={item} />
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <div className="text-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold text-white no-underline transition hover:opacity-90"
            style={{ background: 'var(--purple)' }}
          >
            Join the Community
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Strong copy blockquote */}
      <section className="py-4 text-center">
        <div
          className="mx-auto max-w-3xl rounded-2xl border p-8 sm:p-10"
          style={{ borderColor: 'var(--border-subtle)', background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
        >
          <blockquote>
            <p className="font-serif text-xl font-semibold leading-relaxed text-foreground sm:text-2xl">
              &ldquo;Most clinicians were trained to prescribe psychiatric medications.{' '}
              <span style={{ color: 'var(--purple)' }}>Almost none were trained to stop them.</span>&rdquo;
            </p>
            <p className="mt-4 text-xs font-medium uppercase tracking-widest text-text-subtle">
              This is why TaperCommunity exists
            </p>
          </blockquote>
        </div>
      </section>

      <CommunityPulse large />

      {/* How TaperCommunity compares */}
      <section className="space-y-6">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--purple)' }}>
            Compare
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            How TaperCommunity{' '}
            <span style={{ color: 'var(--purple)' }}>compares</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th className="border px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-subtle" style={{ borderColor: 'var(--border-subtle)' }} />
                <th
                  className="border px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-white"
                  style={{ background: 'var(--purple)', borderColor: 'var(--purple)' }}
                >
                  TaperCommunity
                </th>
                <th className="border px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-text-subtle" style={{ borderColor: 'var(--border-subtle)' }}>BenzoBuddies</th>
                <th className="border px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-text-subtle" style={{ borderColor: 'var(--border-subtle)' }}>SA.org</th>
                <th className="border px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-text-subtle" style={{ borderColor: 'var(--border-subtle)' }}>Reddit</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Daily Symptom Tracking', true, false, false, false],
                ['Drug-Specific Forums', true, 'partial', true, 'partial'],
                ['Find a Deprescriber', true, false, false, false],
                ['Evidence-Based Education', true, false, 'partial', false],
                ['Peer Support Community', true, true, true, true],
                ['Active Development', true, false, false, null],
                ['Always Free', true, true, true, true],
              ].map(([feature, tc, bb, sa, reddit], i) => (
                <tr key={i}>
                  <td className="border px-4 py-3 text-sm font-medium text-foreground" style={{ borderColor: 'var(--border-subtle)' }}>
                    {feature}
                  </td>
                  {[tc, bb, sa, reddit].map((val, j) => (
                    <td
                      key={j}
                      className="border px-4 py-3 text-center"
                      style={{
                        borderColor: 'var(--border-subtle)',
                        background: j === 0 ? 'var(--purple-ghost)' : undefined,
                      }}
                    >
                      {val === true && (
                        <svg className="mx-auto h-5 w-5" style={{ color: j === 0 ? '#22c55e' : '#9ca3af' }} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                      {val === false && (
                        <svg className="mx-auto h-5 w-5" style={{ color: '#d1d5db' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {val === 'partial' && (
                        <span className="text-xs font-medium" style={{ color: j === 0 ? '#22c55e' : '#9ca3af' }}>Partial</span>
                      )}
                      {val === null && (
                        <span className="text-xs text-text-subtle/40">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-6">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--purple)' }}>
            Community Voices
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
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
            className="flex flex-col rounded-2xl border p-6"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
          >
            <svg className="mb-3 h-6 w-6" style={{ color: 'var(--purple)' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.983 5.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
            </svg>
            <p className="flex-1 text-sm leading-relaxed text-text-muted">
              Being able to track my symptoms and share daily check-ins has made all the difference. I actually look forward to logging in each day — the community keeps me accountable and reminds me I&apos;m not doing this alone. For the first time, I feel in control of my taper.
            </p>
            <div className="mt-4 flex items-center gap-3 pt-4">
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

      <ForumSections />

      {/* Floating "Join for Free" button — bottom-left, signed-out only */}
      <Link
        href="/auth/signup"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white shadow-lg no-underline transition hover:scale-105 hover:shadow-xl"
        style={{ background: 'var(--purple)', boxShadow: '0 6px 24px rgba(91,46,145,0.35)' }}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
        Join for Free
      </Link>

      <ExitIntentPopup />
    </div>
  );
}
