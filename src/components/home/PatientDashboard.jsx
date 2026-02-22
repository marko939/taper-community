'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useJournalStore } from '@/stores/journalStore';
import { useForumStore } from '@/stores/forumStore';
import { MOOD_LABELS } from '@/lib/constants';

const BADGES = [
  {
    id: 'first_checkin',
    icon: '🎯',
    label: 'First Check-In',
    desc: 'Logged your first journal entry',
    check: (e) => e.length >= 1,
  },
  {
    id: 'three_checkins',
    icon: '🔥',
    label: '3-Day Streak',
    desc: 'Completed 3 check-ins',
    check: (e) => e.length >= 3,
  },
  {
    id: 'ten_checkins',
    icon: '⭐',
    label: 'Dedicated Tracker',
    desc: '10 check-ins completed',
    check: (e) => e.length >= 10,
  },
  {
    id: 'dose_cut_25',
    icon: '📉',
    label: '25% Dose Cut',
    desc: 'Reduced your dose by 25%',
    check: (entries) => {
      const doses = entries.filter((e) => e.dose_numeric).map((e) => e.dose_numeric);
      if (doses.length < 2) return false;
      const first = doses[doses.length - 1];
      const last = doses[0];
      return last <= first * 0.75;
    },
  },
  {
    id: 'dose_cut_50',
    icon: '🏆',
    label: 'Halfway There',
    desc: 'Cut your dose by 50%',
    check: (entries) => {
      const doses = entries.filter((e) => e.dose_numeric).map((e) => e.dose_numeric);
      if (doses.length < 2) return false;
      const first = doses[doses.length - 1];
      const last = doses[0];
      return last <= first * 0.5;
    },
  },
  {
    id: 'mood_boost',
    icon: '😊',
    label: 'Mood Boost',
    desc: 'Mood improved from a previous entry',
    check: (entries) => {
      if (entries.length < 2) return false;
      for (let i = 0; i < entries.length - 1; i++) {
        if (entries[i].mood_score > entries[i + 1].mood_score) return true;
      }
      return false;
    },
  },
  {
    id: 'community_post',
    icon: '💬',
    label: 'Community Voice',
    desc: 'Shared an entry with the community',
    check: (entries) => entries.some((e) => e.is_public),
  },
  {
    id: 'symptom_free',
    icon: '🌟',
    label: 'Symptom-Free Day',
    desc: 'Logged a day with zero symptoms',
    check: (entries) => entries.some((e) => !e.symptoms || e.symptoms.length === 0),
  },
];

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function daysSince(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

export default function PatientDashboard({ user, profile }) {
  const entries = useJournalStore((s) => s.entries);
  const journalLoading = useJournalStore((s) => s.loading);
  const fetchEntries = useJournalStore((s) => s.fetchEntries);
  const recentThreads = useForumStore((s) => s.recentThreads);
  const fetchRecentThreads = useForumStore((s) => s.fetchRecentThreads);

  useEffect(() => {
    fetchEntries();
    fetchRecentThreads(5);
  }, [fetchEntries, fetchRecentThreads]);

  const loading = journalLoading;
  const threads = recentThreads.items;
  const threadsLoading = recentThreads.loading;

  const lastEntry = entries[0] || null;
  const daysAgo = lastEntry ? daysSince(lastEntry.date) : null;
  const moodColor = lastEntry?.mood_score >= 7 ? '#2EC4B6' : lastEntry?.mood_score >= 4 ? '#F59E0B' : '#EF4444';

  const badges = useMemo(() =>
    BADGES.map((b) => ({ ...b, achieved: b.check(entries) })),
    [entries]
  );
  const achievedCount = badges.filter((b) => b.achieved).length;

  return (
    <div className="space-y-8">
      {/* Welcome + Status Card */}
      <div
        className="relative overflow-hidden rounded-[24px] p-6"
        style={{
          boxShadow: '0 12px 48px rgba(91, 46, 145, 0.25), 0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        <div className="absolute inset-0">
          <img src="/hero-bg.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="pointer-events-none absolute inset-0" style={{ background: 'rgba(42,18,80,0.35)' }} />
        <div className="relative z-10">
          <p className="text-sm font-medium text-white/60">Welcome back</p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            {profile?.display_name || 'there'}
          </h1>

          {loading ? (
            <div className="mt-6 h-16 animate-pulse rounded-xl bg-white/10" />
          ) : lastEntry ? (
            <div className="mt-5 flex items-center justify-between rounded-xl px-5 py-4" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-4">
                {lastEntry.drug && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Dose</p>
                    <p className="text-sm font-bold text-white">{lastEntry.current_dose || '—'} <span className="font-normal text-white/60">{lastEntry.drug}</span></p>
                  </div>
                )}
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Mood</p>
                  <p className="text-sm font-bold" style={{ color: moodColor }}>{lastEntry.mood_score}/10 <span className="font-normal text-white/60">{MOOD_LABELS[lastEntry.mood_score]}</span></p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Last check-in</p>
                  <p className="text-sm text-white/80">{daysAgo === 0 ? 'Today' : `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`}</p>
                </div>
              </div>
              {daysAgo > 0 && (
                <Link
                  href="/journal"
                  className="rounded-lg px-4 py-2 text-xs font-bold text-purple no-underline transition hover:opacity-90"
                  style={{ background: 'white' }}
                >
                  Check in now
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-xl px-5 py-5 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <p className="text-sm text-white/80">Start tracking your taper journey</p>
              <Link
                href="/journal"
                className="mt-3 inline-block rounded-lg px-6 py-2.5 text-sm font-bold text-purple no-underline transition hover:opacity-90"
                style={{ background: 'white' }}
              >
                Log your first entry
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Achievement Badges */}
      {!loading && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-foreground">Achievements</h2>
            <div className="flex items-center gap-2">
              <div className="h-2 w-20 overflow-hidden rounded-full" style={{ background: 'var(--purple-ghost)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.round((achievedCount / BADGES.length) * 100)}%`, background: 'var(--purple)' }}
                />
              </div>
              <span className="text-xs font-semibold text-text-subtle">{achievedCount}/{BADGES.length}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className="flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition"
                style={{
                  borderColor: b.achieved ? 'var(--purple-pale)' : 'var(--border-subtle)',
                  background: b.achieved ? 'var(--purple-ghost)' : 'var(--surface-strong)',
                  opacity: b.achieved ? 1 : 0.5,
                }}
              >
                <span className={`text-2xl ${b.achieved ? '' : 'grayscale'}`}>{b.icon}</span>
                <div>
                  <p className="text-xs font-bold text-foreground">{b.label}</p>
                  <p className="mt-0.5 text-[10px] text-text-subtle">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Posts */}
      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold text-foreground">Recent Posts</h2>
        {threadsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl" style={{ background: 'var(--surface-glass)' }} />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <p className="text-sm text-text-muted">No posts yet. Be the first to start a discussion!</p>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/thread/${thread.id}`}
                className="group block rounded-xl border p-4 no-underline transition hover:border-purple hover:shadow-elevated"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground transition group-hover:text-purple">
                      {thread.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-subtle">
                      {thread.forums?.name && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
                        >
                          {thread.forums.name}
                        </span>
                      )}
                      <span>{thread.profiles?.display_name}</span>
                      <span>&middot;</span>
                      <span>{timeAgo(thread.created_at)}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-[11px] text-text-subtle">
                    <div>{thread.reply_count ?? 0} replies</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
