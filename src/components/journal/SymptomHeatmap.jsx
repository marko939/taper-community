'use client';

import { useMemo } from 'react';
import { SYMPTOMS } from '@/lib/constants';

function getColor(count, max) {
  if (count === 0) return 'var(--surface-glass)';
  const intensity = count / max;
  if (intensity <= 0.25) return 'rgba(91, 46, 145, 0.15)';
  if (intensity <= 0.5) return 'rgba(91, 46, 145, 0.3)';
  if (intensity <= 0.75) return 'rgba(91, 46, 145, 0.5)';
  return 'rgba(91, 46, 145, 0.75)';
}

export default function SymptomHeatmap({ entries }) {
  const { grid, weeks, activeSymptoms, maxCount } = useMemo(() => {
    if (!entries || entries.length === 0) return { grid: [], weeks: [], activeSymptoms: [], maxCount: 0 };

    // Find all symptoms that appear in entries
    const symptomSet = new Set();
    entries.forEach((e) => (e.symptoms || []).forEach((s) => symptomSet.add(s)));
    const active = SYMPTOMS.filter((s) => symptomSet.has(s));
    if (active.length === 0) return { grid: [], weeks: [], activeSymptoms: [], maxCount: 0 };

    // Group entries by week
    const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const weekMap = {};
    sorted.forEach((e) => {
      const d = new Date(e.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      if (!weekMap[key]) weekMap[key] = [];
      weekMap[key].push(e);
    });

    const weekKeys = Object.keys(weekMap).sort();
    // Take last 8 weeks max
    const recentWeeks = weekKeys.slice(-8);

    let max = 0;
    const gridData = active.map((symptom) => {
      const row = recentWeeks.map((week) => {
        const weekEntries = weekMap[week] || [];
        const count = weekEntries.filter((e) => (e.symptoms || []).includes(symptom)).length;
        if (count > max) max = count;
        return { week, count };
      });
      return { symptom, cells: row };
    });

    const weekLabels = recentWeeks.map((w) => {
      const d = new Date(w);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return { grid: gridData, weeks: weekLabels, activeSymptoms: active, maxCount: max };
  }, [entries]);

  if (activeSymptoms.length === 0) {
    return null;
  }

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
    >
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 className="text-sm font-semibold text-foreground">Symptom Heatmap</h3>
        <p className="text-[11px] text-text-subtle">Frequency of symptoms over recent weeks</p>
      </div>
      <div className="overflow-x-auto px-4 py-3">
        <table className="w-full text-[11px]">
          <thead>
            <tr>
              <th className="pb-1.5 pr-3 text-left font-medium text-text-subtle" style={{ minWidth: 100 }}>Symptom</th>
              {weeks.map((w) => (
                <th key={w} className="px-0.5 pb-1.5 text-center font-medium text-text-subtle" style={{ minWidth: 36 }}>
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row) => (
              <tr key={row.symptom}>
                <td className="py-0.5 pr-3 text-text-muted">{row.symptom}</td>
                {row.cells.map((cell) => (
                  <td key={cell.week} className="px-0.5 py-0.5 text-center">
                    <div
                      className="mx-auto h-5 w-5 rounded"
                      style={{ background: getColor(cell.count, maxCount) }}
                      title={`${row.symptom}: ${cell.count} entries`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* Legend */}
        <div className="mt-2 flex items-center gap-2 text-[10px] text-text-subtle">
          <span>Less</span>
          {[0, 0.25, 0.5, 0.75].map((i) => (
            <div key={i} className="h-3 w-3 rounded" style={{ background: getColor(i === 0 ? 0 : Math.ceil(i * maxCount), maxCount) }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
