'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useJournalStore } from '@/stores/journalStore';
import { MOOD_LABELS } from '@/lib/constants';
import CommunityPulse from './CommunityPulse';
import QuickPost from './QuickPost';
import FeedTabs from '../shared/FeedTabs';

function daysSince(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

export default function PatientDashboard({ user, profile }) {
  const entries = useJournalStore((s) => s.entries);
  const journalLoading = useJournalStore((s) => s.loading);
  const fetchEntries = useJournalStore((s) => s.fetchEntries);

  useEffect(() => {
    fetchEntries();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loading = journalLoading;

  const lastEntry = entries[0] || null;
  const daysAgo = lastEntry ? daysSince(lastEntry.date) : null;
  const moodColor = lastEntry?.mood_score >= 7 ? '#2EC4B6' : lastEntry?.mood_score >= 4 ? '#F59E0B' : '#EF4444';

  return (
    <div className="space-y-6">
      {/* Welcome + Status Card */}
      <div
        className="relative overflow-hidden rounded-2xl p-4 sm:rounded-[24px] sm:p-6"
        style={{
          boxShadow: '0 12px 48px rgba(91, 46, 145, 0.25), 0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        <div className="absolute inset-0">
          <Image src="/hero-bg.png" alt="" fill className="object-cover" priority />
        </div>
        <div className="pointer-events-none absolute inset-0" style={{ background: 'rgba(42,18,80,0.35)' }} />
        <div className="relative z-10">
          <p className="text-sm font-medium text-white/60">Welcome back</p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            {profile?.display_name || 'there'}
          </h1>

          {loading ? (
            <div className="mt-6 h-20 animate-pulse rounded-xl bg-white/10" />
          ) : lastEntry ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:flex sm:gap-3">
                {lastEntry.drug && (
                  <div className="rounded-xl p-3 sm:flex-1 sm:p-4" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Current Dose</p>
                    <p className="mt-1 text-base font-bold text-white sm:text-lg">{lastEntry.current_dose || '—'}</p>
                    <p className="text-[11px] text-white/70">{lastEntry.drug}</p>
                  </div>
                )}
                <div className="rounded-xl p-3 sm:flex-1 sm:p-4" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Mood</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-base font-bold sm:text-lg" style={{ color: moodColor }}>{lastEntry.mood_score}/10</span>
                    <span className="text-[11px] text-white/70">{MOOD_LABELS[lastEntry.mood_score]}</span>
                  </div>
                </div>
                <div className="col-span-2 rounded-xl p-3 sm:col-span-1 sm:flex-1 sm:p-4" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Symptoms</p>
                  {lastEntry.symptoms && lastEntry.symptoms.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {lastEntry.symptoms.slice(0, 3).map((s) => (
                        <span key={s} className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: 'rgba(255,255,255,0.2)' }}>
                          {s}
                        </span>
                      ))}
                      {lastEntry.symptoms.length > 3 && (
                        <span className="text-[10px] text-white/50">+{lastEntry.symptoms.length - 3}</span>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm font-medium text-white/70">None reported</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 sm:mt-4 sm:px-5 sm:py-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <p className="min-w-0 text-xs text-white/80 sm:text-sm">
                  {daysAgo === 0
                    ? 'You checked in today'
                    : `Last check-in ${daysAgo}d ago`}
                </p>
                {daysAgo > 0 && (
                  <Link
                    href="/journal"
                    className="shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold text-purple no-underline transition active:scale-95 sm:px-4 sm:py-2 sm:text-xs"
                    style={{ background: 'white' }}
                  >
                    Check in
                  </Link>
                )}
              </div>
            </>
          ) : (
            <div className="mt-6 flex items-center justify-between rounded-xl px-5 py-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <p className="text-sm text-white/80">Welcome! Introduce yourself to the community</p>
              <button
                type="button"
                onClick={() => document.getElementById('quick-post')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-lg px-4 py-2 text-xs font-bold text-purple no-underline transition hover:opacity-90"
                style={{ background: 'white' }}
              >
                Introduce yourself
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Community Pulse */}
      <CommunityPulse />

      {/* 3-Tab Feed Switcher: Hot | New | Following */}
      <FeedTabs />

      {/* Quick Post */}
      <section id="quick-post">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          {!profile?.post_count ? 'Introduce Yourself' : 'Start a Discussion'}
        </h2>
        <div
          className="rounded-xl border p-4"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
        >
          <QuickPost user={user} profile={profile} />
        </div>
      </section>
    </div>
  );
}
