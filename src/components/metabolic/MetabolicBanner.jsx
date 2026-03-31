'use client';

export default function MetabolicBanner() {
  return (
    <div
      className="rounded-2xl border px-5 py-4"
      style={{
        background: 'var(--metabolic-green-ghost)',
        borderColor: 'var(--metabolic-green-light)',
      }}
    >
      <p className="text-sm leading-relaxed" style={{ color: 'var(--metabolic-green-dark)' }}>
        <span className="mr-1.5 text-base">🌿</span>
        Many members find tapering goes smoother when their metabolism is stable.
        You don&apos;t have to do this perfectly — even small changes can help.
      </p>
    </div>
  );
}
