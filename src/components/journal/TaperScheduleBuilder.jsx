'use client';

import { useState, useMemo } from 'react';

function generateSchedule(startDose, targetDose, steps, intervalWeeks, startDate) {
  if (startDose <= 0 || targetDose < 0 || steps < 1) return [];

  const schedule = [];
  const reduction = (startDose - targetDose) / steps;

  for (let i = 0; i <= steps; i++) {
    const dose = Math.max(targetDose, startDose - reduction * i);
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * intervalWeeks * 7);
    const pct = Math.round((dose / startDose) * 100);

    schedule.push({
      step: i,
      dose: Math.round(dose * 100) / 100,
      pct,
      date: date.toISOString().split('T')[0],
      dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });
  }

  return schedule;
}

export default function TaperScheduleBuilder({ entries }) {
  const latestDose = useMemo(() => {
    if (!entries || entries.length === 0) return 0;
    const withDose = entries.find((e) => e.dose_numeric > 0);
    return withDose?.dose_numeric || 0;
  }, [entries]);

  const latestDrug = useMemo(() => {
    if (!entries || entries.length === 0) return '';
    return entries.find((e) => e.drug)?.drug || '';
  }, [entries]);

  const [startDose, setStartDose] = useState(latestDose || 20);
  const [targetDose, setTargetDose] = useState(0);
  const [steps, setSteps] = useState(4);
  const [intervalWeeks, setIntervalWeeks] = useState(2);
  const [expanded, setExpanded] = useState(false);

  // Sync if entries load after mount
  useMemo(() => {
    if (latestDose > 0 && startDose === 20) setStartDose(latestDose);
  }, [latestDose]);

  const schedule = useMemo(
    () => generateSchedule(startDose, targetDose, steps, intervalWeeks, new Date().toISOString().split('T')[0]),
    [startDose, targetDose, steps, intervalWeeks]
  );

  const totalWeeks = steps * intervalWeeks;

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-foreground">Taper Schedule Planner</h3>
          <p className="text-[11px] text-text-subtle">
            Plan your dose reductions{latestDrug ? ` for ${latestDrug}` : ''}
          </p>
        </div>
        <svg
          className={`h-4 w-4 shrink-0 text-text-subtle transition ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && (
        <div className="space-y-4 px-4 pb-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-text-subtle">Start dose (mg)</label>
              <input
                type="number"
                value={startDose}
                onChange={(e) => setStartDose(parseFloat(e.target.value) || 0)}
                className="input text-sm"
                min="0"
                step="0.5"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-text-subtle">Target dose (mg)</label>
              <input
                type="number"
                value={targetDose}
                onChange={(e) => setTargetDose(parseFloat(e.target.value) || 0)}
                className="input text-sm"
                min="0"
                step="0.5"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-text-subtle">Number of steps</label>
              <input
                type="number"
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value) || 1)}
                className="input text-sm"
                min="1"
                max="20"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-text-subtle">Weeks per step</label>
              <input
                type="number"
                value={intervalWeeks}
                onChange={(e) => setIntervalWeeks(parseInt(e.target.value) || 1)}
                className="input text-sm"
                min="1"
                max="12"
              />
            </div>
          </div>

          <p className="text-[11px] text-text-subtle">
            Total duration: <span className="font-semibold">{totalWeeks} weeks</span> ({Math.round(totalWeeks / 4.3)} months)
          </p>

          {/* Schedule timeline */}
          <div className="relative space-y-0">
            {schedule.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                {/* Vertical line connector */}
                <div className="relative flex h-10 w-5 flex-col items-center">
                  <div
                    className="h-3 w-3 rounded-full border-2"
                    style={{
                      borderColor: step.pct === 0 ? '#2EC4B6' : 'var(--purple)',
                      background: i === 0 ? 'var(--purple)' : step.pct === 0 ? '#2EC4B6' : 'transparent',
                    }}
                  />
                  {i < schedule.length - 1 && (
                    <div className="w-px flex-1" style={{ background: 'var(--border-subtle)' }} />
                  )}
                </div>
                <div className="flex flex-1 items-center justify-between py-1">
                  <div>
                    <span className="text-xs font-semibold text-foreground">{step.dose}mg</span>
                    <span className="ml-1.5 text-[10px] text-text-subtle">({step.pct}%)</span>
                  </div>
                  <span className="text-[10px] text-text-subtle">{step.dateLabel}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="rounded-lg px-3 py-2 text-[10px] text-text-subtle" style={{ background: 'var(--purple-ghost)' }}>
            This is a planning tool only. Always consult your clinician before making dose changes.
            Hyperbolic tapers (smaller cuts at lower doses) are generally recommended.
          </p>
        </div>
      )}
    </div>
  );
}
