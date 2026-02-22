'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MOOD_LABELS } from '@/lib/constants';
import { useRecentThreads } from '@/hooks/useForumData';

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
  const [lastEntry, setLastEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const { threads, loading: threadsLoading } = useRecentThreads(5);
  const supabase = createClient();

  useEffect(() => {
    const fetchLatest = async () => {
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1);

      if (data && data.length > 0) setLastEntry(data[0]);
      setLoading(false);
    };
    fetchLatest();
  }, [user.id]);

  const daysAgo = lastEntry ? daysSince(lastEntry.date) : null;
  const moodColor = lastEntry?.mood_score >= 7 ? '#2EC4B6' : lastEntry?.mood_score >= 4 ? '#F59E0B' : '#EF4444';

  return (
    <div className="space-y-8">
      {/* Welcome + Status Card */}
      <div
        className="relative overflow-hidden rounded-[24px] p-6"
        style={{
          boxShadow: '0 12px 48px rgba(91, 46, 145, 0.25), 0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        {/* Background image — same as landing hero */}
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
              {/* Status Strip */}
              <div className="mt-6 flex gap-3">
                {/* Current Dose */}
                {lastEntry.drug && (
                  <div className="flex-1 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Current Dose</p>
                    <p className="mt-1 text-lg font-bold text-white">{lastEntry.current_dose || '—'}</p>
                    <p className="text-xs text-white/70">{lastEntry.drug}</p>
                  </div>
                )}

                {/* Mood */}
                <div className="flex-1 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Mood</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-lg font-bold" style={{ color: moodColor }}>{lastEntry.mood_score}/10</span>
                    <span className="text-xs text-white/70">{MOOD_LABELS[lastEntry.mood_score]}</span>
                  </div>
                </div>

                {/* Symptoms */}
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

              {/* Check-in Prompt */}
              <div className="mt-4 flex items-center justify-between rounded-xl px-5 py-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div>
                  <p className="text-sm text-white/80">
                    {daysAgo === 0
                      ? 'You checked in today'
                      : `Your last check-in was ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`}
                  </p>
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
            </>
          ) : (
            /* No entries yet */
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
