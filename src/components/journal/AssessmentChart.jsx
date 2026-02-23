'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceArea,
} from 'recharts';
import { labelPHQ, labelGAD } from '@/lib/assessments';

function AssessmentTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border-subtle bg-white p-3 text-xs shadow-lg" style={{ maxWidth: 220 }}>
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry, i) => {
        if (entry.dataKey === 'dose') {
          return (
            <p key={i} style={{ color: entry.color }}>
              Dose: {entry.value}mg
            </p>
          );
        }
        const labelFn = entry.dataKey === 'phq9' ? labelPHQ : labelGAD;
        return (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {entry.value} — {labelFn(entry.value)}
          </p>
        );
      })}
    </div>
  );
}

export default function AssessmentChart({ assessments = [], entries = [] }) {
  const chartData = useMemo(() => {
    if (!assessments.length) return [];

    // Group assessments by date, keep latest of each type per date
    const dateMap = {};
    const sorted = [...assessments].sort((a, b) => new Date(a.date) - new Date(b.date));

    for (const a of sorted) {
      const dateKey = a.date;
      if (!dateMap[dateKey]) dateMap[dateKey] = {};
      dateMap[dateKey][a.type] = a.score;
    }

    // Build a lookup of closest dose for each assessment date
    const sortedEntries = [...(entries || [])].sort((a, b) => new Date(a.date) - new Date(b.date));

    function closestDose(targetDate) {
      if (!sortedEntries.length) return null;
      const target = new Date(targetDate).getTime();
      let best = null;
      let bestDiff = Infinity;
      for (const e of sortedEntries) {
        if (!e.dose_numeric) continue;
        const diff = Math.abs(new Date(e.date).getTime() - target);
        if (diff < bestDiff) { bestDiff = diff; best = e.dose_numeric; }
      }
      return best;
    }

    return Object.entries(dateMap).map(([date, scores]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rawDate: date,
      phq9: scores.phq9 ?? null,
      gad7: scores.gad7 ?? null,
      dose: closestDose(date),
    }));
  }, [assessments, entries]);

  const hasDoseData = chartData.some((d) => d.dose != null);

  if (assessments.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-text-muted">
        Take an assessment to see your chart
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#5B2E91' }} />
          <span className="text-[11px] text-text-subtle">PHQ-9 (Depression)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#2EC4B6' }} />
          <span className="text-[11px] text-text-subtle">GAD-7 (Anxiety)</span>
        </div>
        {hasDoseData && (
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#7B4FAF' }} />
            <span className="text-[11px] text-text-subtle">Dose (mg)</span>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          {/* Severity zone bands */}
          <ReferenceArea yAxisId="score" y1={0} y2={4} fill="#22c55e" fillOpacity={0.08} />
          <ReferenceArea yAxisId="score" y1={4} y2={9} fill="#eab308" fillOpacity={0.08} />
          <ReferenceArea yAxisId="score" y1={9} y2={14} fill="#f97316" fillOpacity={0.08} />
          <ReferenceArea yAxisId="score" y1={14} y2={27} fill="#ef4444" fillOpacity={0.08} />

          <CartesianGrid strokeDasharray="3 3" stroke="#E8E5F0" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#7C7591', fontSize: 12 }}
            axisLine={{ stroke: '#E8E5F0' }}
          />
          <YAxis
            yAxisId="score"
            domain={[0, 27]}
            reversed
            tick={{ fill: '#7C7591', fontSize: 12 }}
            axisLine={{ stroke: '#E8E5F0' }}
            label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#7C7591', fontSize: 11 }}
          />
          {hasDoseData && (
            <YAxis
              yAxisId="dose"
              orientation="right"
              tick={{ fill: '#7C7591', fontSize: 12 }}
              axisLine={{ stroke: '#E8E5F0' }}
              label={{ value: 'Dose (mg)', angle: 90, position: 'insideRight', fill: '#7C7591', fontSize: 11 }}
            />
          )}
          <Tooltip content={<AssessmentTooltip />} />
          <Line
            yAxisId="score"
            type="monotone"
            dataKey="phq9"
            name="PHQ-9"
            stroke="#5B2E91"
            strokeWidth={2}
            dot={{ fill: '#5B2E91', r: 5 }}
            connectNulls
          />
          <Line
            yAxisId="score"
            type="monotone"
            dataKey="gad7"
            name="GAD-7"
            stroke="#2EC4B6"
            strokeWidth={2}
            dot={{ fill: '#2EC4B6', r: 5 }}
            connectNulls
          />
          {hasDoseData && (
            <Line
              yAxisId="dose"
              type="monotone"
              dataKey="dose"
              name="Dose"
              stroke="#7B4FAF"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={{ fill: '#7B4FAF', r: 3 }}
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center gap-3 text-[10px] text-text-subtle">
        <span><span className="inline-block h-1.5 w-3 rounded-sm" style={{ background: '#22c55e', opacity: 0.3 }} /> Minimal (0-4)</span>
        <span><span className="inline-block h-1.5 w-3 rounded-sm" style={{ background: '#eab308', opacity: 0.3 }} /> Mild (5-9)</span>
        <span><span className="inline-block h-1.5 w-3 rounded-sm" style={{ background: '#f97316', opacity: 0.3 }} /> Moderate (10-14)</span>
        <span><span className="inline-block h-1.5 w-3 rounded-sm" style={{ background: '#ef4444', opacity: 0.3 }} /> Severe (15+)</span>
      </div>
    </div>
  );
}
