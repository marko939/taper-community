'use client';

import { useMemo, useState } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  // Check for annotation
  const annotation = payload[0]?.payload?.annotation;

  return (
    <div className="rounded-xl border border-border-subtle bg-white p-3 text-xs shadow-lg" style={{ maxWidth: 200 }}>
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
          {entry.name === 'Dose' ? 'mg' : '/10'}
        </p>
      ))}
      {annotation && (
        <p className="mt-1.5 border-t pt-1.5 text-[11px]" style={{ borderColor: '#e2e8f0', color: '#5B2E91' }}>
          {annotation.icon} {annotation.label}
        </p>
      )}
      {payload[0]?.payload?.assessmentInfo && (
        <p className="mt-1 text-[11px]" style={{ color: '#7c3aed' }}>
          {payload[0].payload.assessmentInfo}
        </p>
      )}
    </div>
  );
}

function detectAnnotations(entries) {
  if (!entries || entries.length < 2) return [];

  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const annotations = [];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    // Dose change
    if (prev.dose_numeric && curr.dose_numeric && prev.dose_numeric !== curr.dose_numeric) {
      const change = curr.dose_numeric - prev.dose_numeric;
      const pctChange = Math.round((Math.abs(change) / prev.dose_numeric) * 100);
      if (pctChange >= 5) {
        annotations.push({
          date: curr.date,
          type: 'dose_change',
          icon: change < 0 ? '\u2193' : '\u2191',
          label: `Dose ${change < 0 ? 'decreased' : 'increased'} ${pctChange}% (${prev.dose_numeric}mg \u2192 ${curr.dose_numeric}mg)`,
        });
      }
    }

    // Symptom spike (3+ more symptoms than previous)
    const prevCount = (prev.symptoms || []).length;
    const currCount = (curr.symptoms || []).length;
    if (currCount >= prevCount + 3) {
      annotations.push({
        date: curr.date,
        type: 'symptom_spike',
        icon: '\u26A0',
        label: `Symptom spike: ${currCount} symptoms (up from ${prevCount})`,
      });
    }

    // Mood milestone (reached 8+ for first time)
    if (curr.mood_score >= 8 && prev.mood_score < 8) {
      annotations.push({
        date: curr.date,
        type: 'milestone',
        icon: '\u2605',
        label: `Mood milestone: ${curr.mood_score}/10`,
      });
    }
  }

  return annotations;
}

export default function JournalChart({ entries = [], assessments = [] }) {
  const [showAnnotations, setShowAnnotations] = useState(true);

  const { chartData, annotations, assessmentDots } = useMemo(() => {
    if (entries.length === 0) return { chartData: [], annotations: [], assessmentDots: [] };

    const annots = detectAnnotations(entries);
    const annotMap = {};
    annots.forEach((a) => { annotMap[a.date] = a; });

    const data = [...entries]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((entry) => ({
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rawDate: entry.date,
        dose: entry.dose_numeric,
        mood: entry.mood_score,
        annotation: annotMap[entry.date] || null,
      }));

    // Build assessment dots that align with chart dates
    const dots = [];
    if (assessments?.length) {
      const dateToChartDate = {};
      data.forEach((d) => { dateToChartDate[d.rawDate] = d.date; });
      for (const a of assessments) {
        const chartDate = dateToChartDate[a.date];
        if (chartDate) {
          const matchingEntry = data.find((d) => d.date === chartDate);
          if (matchingEntry) {
            dots.push({
              x: chartDate,
              y: matchingEntry.mood,
              type: a.type,
              score: a.score,
            });
          }
        }
      }
    }

    return { chartData: data, annotations: annots, assessmentDots: dots };
  }, [entries, assessments]);

  if (entries.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-text-muted">
        Add entries to see your taper chart
      </div>
    );
  }

  const annotatedPoints = showAnnotations
    ? chartData.filter((d) => d.annotation)
    : [];

  return (
    <div>
      {annotations.length > 0 && (
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-subtle">{annotations.length} annotation{annotations.length !== 1 ? 's' : ''}</span>
          </div>
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className="text-[11px] font-medium"
            style={{ color: 'var(--purple)' }}
          >
            {showAnnotations ? 'Hide annotations' : 'Show annotations'}
          </button>
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E5F0" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#7C7591', fontSize: 12 }}
            axisLine={{ stroke: '#E8E5F0' }}
          />
          <YAxis
            yAxisId="dose"
            orientation="left"
            tick={{ fill: '#7C7591', fontSize: 12 }}
            axisLine={{ stroke: '#E8E5F0' }}
            label={{ value: 'Dose (mg)', angle: -90, position: 'insideLeft', fill: '#7C7591', fontSize: 11 }}
          />
          <YAxis
            yAxisId="mood"
            orientation="right"
            domain={[1, 10]}
            tick={{ fill: '#7C7591', fontSize: 12 }}
            axisLine={{ stroke: '#E8E5F0' }}
            label={{ value: 'Mood', angle: 90, position: 'insideRight', fill: '#7C7591', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            yAxisId="dose"
            type="monotone"
            dataKey="dose"
            name="Dose"
            stroke="#5B2E91"
            strokeWidth={2}
            dot={{ fill: '#5B2E91', r: 4 }}
            connectNulls
          />
          <Area
            yAxisId="mood"
            type="monotone"
            dataKey="mood"
            name="Mood"
            stroke="#2EC4B6"
            fill="#2EC4B6"
            fillOpacity={0.12}
            strokeWidth={2}
            connectNulls
          />
          {annotatedPoints.map((point, i) => (
            <ReferenceDot
              key={i}
              x={point.date}
              y={point.dose || point.mood}
              yAxisId={point.dose ? 'dose' : 'mood'}
              r={6}
              fill={
                point.annotation.type === 'dose_change' ? '#5B2E91'
                : point.annotation.type === 'symptom_spike' ? '#EF4444'
                : '#2EC4B6'
              }
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
          {assessmentDots.map((dot, i) => (
            <ReferenceDot
              key={`assess-${i}`}
              x={dot.x}
              y={dot.y}
              yAxisId="mood"
              r={5}
              fill={dot.type === 'phq9' ? '#7c3aed' : '#0d9488'}
              stroke="#fff"
              strokeWidth={2}
              shape="diamond"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
