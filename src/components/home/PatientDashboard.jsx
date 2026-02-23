'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useJournalStore } from '@/stores/journalStore';
import { useForumStore } from '@/stores/forumStore';
import { MOOD_LABELS } from '@/lib/constants';
import { detectMilestones } from '@/lib/milestones';
import CommunityPulse from './CommunityPulse';

// SVG icon components for badges
const BadgeIcon = ({ id, achieved }) => {
  const color = achieved ? 'var(--purple)' : 'var(--text-subtle)';
  const icons = {
    first_checkin: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    three_checkins: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
      </svg>
    ),
    ten_checkins: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    dose_cut_25: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
      </svg>
    ),
    dose_cut_50: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-7.54 0" />
      </svg>
    ),
    mood_boost: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    community_post: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    symptom_free: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  };
  return icons[id] || null;
};

const BADGES = [
  {
    id: 'first_checkin',
    label: 'First Check-In',
    desc: 'Logged your first journal entry',
    check: (e) => e.length >= 1,
  },
  {
    id: 'three_checkins',
    label: '3-Day Streak',
    desc: 'Completed 3 check-ins',
    check: (e) => e.length >= 3,
  },
  {
    id: 'ten_checkins',
    label: 'Dedicated Tracker',
    desc: '10 check-ins completed',
    check: (e) => e.length >= 10,
  },
  {
    id: 'dose_cut_25',
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
    label: 'Community Voice',
    desc: 'Shared an entry with the community',
    check: (entries) => entries.some((e) => e.is_public),
  },
  {
    id: 'symptom_free',
    label: 'Symptom-Free Day',
    desc: 'Logged a day with zero symptoms',
    check: (entries) => entries.some((e) => !e.symptoms || e.symptoms.length === 0),
  },
];

// Pick 3 badges to display: last achieved + next unachieved, filling to 3
function pickDisplayBadges(badges) {
  const achieved = badges.filter((b) => b.achieved);
  const unachieved = badges.filter((b) => !b.achieved);
  const picked = [];
  // Most recent achieved (last in order)
  if (achieved.length > 0) picked.push(achieved[achieved.length - 1]);
  if (achieved.length > 1) picked.push(achieved[achieved.length - 2]);
  // Next unachieved
  if (unachieved.length > 0 && picked.length < 3) picked.push(unachieved[0]);
  // Fill remaining
  while (picked.length < 3 && unachieved.length > picked.length - achieved.length) {
    const next = unachieved[picked.length - Math.min(achieved.length, 2)];
    if (next && !picked.includes(next)) picked.push(next);
    else break;
  }
  return picked.slice(0, 3);
}

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

  const displayBadges = useMemo(() => pickDisplayBadges(badges), [badges]);

  return (
    <div className="space-y-6">
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
            <div className="mt-6 h-20 animate-pulse rounded-xl bg-white/10" />
          ) : lastEntry ? (
            <>
              <div className="mt-6 flex gap-3">
                {lastEntry.drug && (
                  <div className="flex-1 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Current Dose</p>
                    <p className="mt-1 text-lg font-bold text-white">{lastEntry.current_dose || '—'}</p>
                    <p className="text-xs text-white/70">{lastEntry.drug}</p>
                  </div>
                )}
                <div className="flex-1 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Mood</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-lg font-bold" style={{ color: moodColor }}>{lastEntry.mood_score}/10</span>
                    <span className="text-xs text-white/70">{MOOD_LABELS[lastEntry.mood_score]}</span>
                  </div>
                </div>
                <div className="flex-1 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
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
              <div className="mt-4 flex items-center justify-between rounded-xl px-5 py-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <p className="text-sm text-white/80">
                  {daysAgo === 0
                    ? 'You checked in today'
                    : `Your last check-in was ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`}
                </p>
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
            </>
          ) : (
            <div className="mt-6 rounded-xl px-5 py-6 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
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

      {/* Achievement Badges — show 3 at a time */}
      {!loading && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Achievements</h2>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ background: 'var(--purple-ghost)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.round((achievedCount / BADGES.length) * 100)}%`, background: 'var(--purple)' }}
                />
              </div>
              <span className="text-[11px] font-semibold text-text-subtle">{achievedCount}/{BADGES.length}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {displayBadges.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition"
                style={{
                  borderColor: b.achieved ? 'var(--purple-pale)' : 'var(--border-subtle)',
                  background: b.achieved ? 'var(--purple-ghost)' : 'var(--surface-strong)',
                  opacity: b.achieved ? 1 : 0.45,
                }}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: b.achieved ? 'var(--purple-pale)' : 'var(--surface-glass)' }}
                >
                  <BadgeIcon id={b.id} achieved={b.achieved} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold leading-tight text-foreground">{b.label}</p>
                  <p className="text-[10px] leading-tight text-text-subtle">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Taper Milestones */}
      {!loading && entries.length > 0 && (() => {
        const milestones = detectMilestones(entries, profile);
        const achieved = milestones.filter((m) => m.achieved);
        if (achieved.length === 0) return null;
        return (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Milestones</h2>
            <div className="flex flex-wrap gap-2">
              {achieved.map((m) => (
                <span
                  key={m.id}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{ background: 'var(--purple-ghost)', color: 'var(--purple)' }}
                >
                  {m.emoji} {m.label}
                </span>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Community Pulse */}
      <CommunityPulse />

      {/* Recent Posts — top 3 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Posts</h2>
        {threadsLoading ? (
          <div className="h-16 animate-pulse rounded-xl" style={{ background: 'var(--surface-glass)' }} />
        ) : threads.length === 0 ? (
          <p className="text-sm text-text-muted">No posts yet. Be the first to start a discussion!</p>
        ) : (
          <div className="space-y-2">
            {threads.slice(0, 3).map((thread) => (
              <Link
                key={thread.id}
                href={`/thread/${thread.id}`}
                className="group block rounded-xl border p-3.5 no-underline transition hover:border-purple hover:shadow-elevated"
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
