'use client';

import { useMemo } from 'react';

function computeStreaks(entries) {
  if (!entries || entries.length === 0) return { current: 0, longest: 0, total: entries?.length || 0 };

  // Get unique dates sorted descending
  const dates = [...new Set(entries.map((e) => e.date))].sort((a, b) => b.localeCompare(a));
  if (dates.length === 0) return { current: 0, longest: 0, total: 0 };

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Current streak — must include today or yesterday
  let current = 0;
  if (dates[0] === today || dates[0] === yesterday) {
    current = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diffDays = Math.round((prev - curr) / 86400000);
      if (diffDays === 1) current++;
      else break;
    }
  }

  // Longest streak
  let longest = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = Math.round((prev - curr) / 86400000);
    if (diffDays === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }
  if (dates.length === 1) longest = 1;

  return { current, longest, total: dates.length };
}

function stabilityScore(entries) {
  if (!entries || entries.length < 3) return null;
  const recent = entries.slice(0, 7); // last 7 entries
  const moods = recent.filter((e) => e.mood_score).map((e) => e.mood_score);
  if (moods.length < 2) return null;
  const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
  const variance = moods.reduce((sum, m) => sum + (m - avg) ** 2, 0) / moods.length;
  // Score: high avg + low variance = stable. Scale 0-100
  const avgScore = (avg / 10) * 60; // 60% weight to average mood
  const varianceScore = Math.max(0, 40 - variance * 5); // 40% weight to stability
  return Math.round(Math.min(100, avgScore + varianceScore));
}

export default function StreakTracker({ entries }) {
  const streaks = useMemo(() => computeStreaks(entries), [entries]);
  const stability = useMemo(() => stabilityScore(entries), [entries]);

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-foreground">Streak & Stability</h2>
      <div className="grid grid-cols-3 gap-2">
        {/* Current Streak */}
        <div
          className="flex flex-col items-center rounded-xl border px-3 py-3"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
        >
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4" style={{ color: streaks.current > 0 ? 'var(--accent-warn)' : 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            </svg>
            <span className="text-xl font-bold text-foreground">{streaks.current}</span>
          </div>
          <p className="mt-0.5 text-[10px] text-text-subtle">Day streak</p>
        </div>

        {/* Longest Streak */}
        <div
          className="flex flex-col items-center rounded-xl border px-3 py-3"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
        >
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4" style={{ color: 'var(--purple)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-7.54 0" />
            </svg>
            <span className="text-xl font-bold text-foreground">{streaks.longest}</span>
          </div>
          <p className="mt-0.5 text-[10px] text-text-subtle">Best streak</p>
        </div>

        {/* Stability Score */}
        <div
          className="flex flex-col items-center rounded-xl border px-3 py-3"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
        >
          <div className="flex items-center gap-1.5">
            <svg className="h-4 w-4" style={{ color: stability !== null && stability >= 60 ? '#2EC4B6' : 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span className="text-xl font-bold text-foreground">{stability !== null ? stability : '--'}</span>
          </div>
          <p className="mt-0.5 text-[10px] text-text-subtle">Stability</p>
        </div>
      </div>
    </section>
  );
}
