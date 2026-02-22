'use client';

import { useMemo } from 'react';

export default function DosePercentage({ entries }) {
  const data = useMemo(() => {
    if (!entries || entries.length < 2) return null;

    const withDose = entries.filter((e) => e.dose_numeric > 0);
    if (withDose.length < 2) return null;

    const original = withDose[withDose.length - 1].dose_numeric; // oldest entry
    const current = withDose[0].dose_numeric; // newest entry
    const pct = Math.round((current / original) * 100);
    const reduced = 100 - pct;

    return { original, current, pct, reduced, drug: withDose[0].drug };
  }, [entries]);

  if (!data) return null;

  const ringPct = Math.min(100, data.reduced);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (ringPct / 100) * circumference;

  return (
    <div
      className="flex items-center gap-5 rounded-xl border px-5 py-4"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
    >
      <div className="relative h-24 w-24 shrink-0">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--purple-ghost)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke="var(--purple)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-foreground">{data.reduced}%</span>
          <span className="text-[9px] text-text-subtle">reduced</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">Dose Progress</p>
        <p className="mt-1 text-xs text-text-muted">
          Started at <span className="font-semibold">{data.original}mg</span>, currently at{' '}
          <span className="font-semibold">{data.current}mg</span>
          {data.drug && <span className="text-text-subtle"> ({data.drug})</span>}
        </p>
        <p className="mt-0.5 text-xs text-text-subtle">
          {data.pct}% of original dose remaining
        </p>
      </div>
    </div>
  );
}
