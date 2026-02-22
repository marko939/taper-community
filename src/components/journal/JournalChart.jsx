'use client';

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border-subtle bg-white p-3 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
          {entry.name === 'Dose' ? 'mg' : '/10'}
        </p>
      ))}
    </div>
  );
}

export default function JournalChart({ entries = [] }) {
  if (entries.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-text-muted">
        Add entries to see your taper chart
      </div>
    );
  }

  const chartData = [...entries]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dose: entry.dose_numeric,
      mood: entry.mood_score,
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis
          yAxisId="dose"
          orientation="left"
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#e2e8f0' }}
          label={{ value: 'Dose (mg)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
        />
        <YAxis
          yAxisId="mood"
          orientation="right"
          domain={[1, 10]}
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#e2e8f0' }}
          label={{ value: 'Mood', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 11 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          yAxisId="dose"
          type="monotone"
          dataKey="dose"
          name="Dose"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ fill: '#2563eb', r: 4 }}
          connectNulls
        />
        <Area
          yAxisId="mood"
          type="monotone"
          dataKey="mood"
          name="Mood"
          stroke="#0f766e"
          fill="#0f766e"
          fillOpacity={0.1}
          strokeWidth={2}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
