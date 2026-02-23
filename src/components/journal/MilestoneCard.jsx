'use client';

import MoodSparkline from './MoodSparkline';

export default function MilestoneCard({ milestone, shareText, entries, cardRef }) {
  return (
    <div
      ref={cardRef}
      style={{
        width: 400,
        padding: 32,
        borderRadius: 20,
        background: 'linear-gradient(135deg, #3D1D63, #5B2E91)',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }}
      />

      {/* Branding */}
      <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.6, letterSpacing: 1, textTransform: 'uppercase' }}>
        TaperCommunity
      </div>

      {/* Emoji */}
      <div style={{ fontSize: 48, marginTop: 16 }}>
        {milestone.emoji}
      </div>

      {/* Headline */}
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 12, lineHeight: 1.3 }}>
        {shareText}
      </div>

      {/* Sparkline */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 4 }}>Mood (last 14 entries)</div>
        <MoodSparkline entries={entries} width={336} height={40} />
      </div>

      {/* URL */}
      <div style={{ marginTop: 16, fontSize: 11, opacity: 0.5 }}>
        tapercommunity.com
      </div>
    </div>
  );
}
