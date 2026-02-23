'use client';

export default function MoodSparkline({ entries, width = 120, height = 32 }) {
  const last14 = [...entries]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-14)
    .filter((e) => e.mood_score != null);

  if (last14.length < 2) return null;

  const padding = 2;
  const w = width - padding * 2;
  const h = height - padding * 2;

  const points = last14.map((entry, i) => {
    const x = padding + (i / (last14.length - 1)) * w;
    const y = padding + h - ((entry.mood_score - 1) / 9) * h;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
