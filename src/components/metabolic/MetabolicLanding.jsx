'use client';

import Link from 'next/link';

export default function MetabolicLanding() {
  return (
    <div>
      {/* Hero */}
      <h1
        className="text-3xl font-bold leading-tight sm:text-4xl"
        style={{ fontFamily: 'Fraunces, Georgia, serif', color: 'var(--foreground)' }}
      >
        Metabolic Psychiatry & Tapering
      </h1>

      <div className="mt-6 space-y-5 text-[15px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        <p>
          Metabolic psychiatry is a growing field that connects how your body produces and uses energy to
          how your brain functions. The core insight: your brain consumes 20% of your total energy output,
          and the quality and stability of that energy supply has a direct impact on mood, cognition,
          anxiety, and mental resilience.
        </p>
        <p>
          Researchers like Dr. Chris Palmer at Harvard and Dr. Georgia Ede have shown that dietary
          interventions — particularly ketogenic and low-carb approaches — can improve mitochondrial
          function, reduce neuroinflammation, and stabilize neurotransmitter systems. These aren't fringe
          ideas: they're backed by a growing body of clinical research and case reports.
        </p>
      </div>

      {/* Infographic */}
      <div className="my-8 flex justify-center">
        <div
          className="rounded-2xl border px-6 py-5"
          style={{ background: 'var(--surface-strong)', borderColor: 'var(--border-subtle)' }}
        >
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>
            The brain–energy connection
          </p>
          <div className="flex items-center">
            {[
              { emoji: '🥗', label: 'Diet' },
              { emoji: '⚡', label: 'Mitochondria' },
              { emoji: '🔋', label: 'Brain Energy' },
              { emoji: '🧬', label: 'Neurotransmitters' },
              { emoji: '🧠', label: 'Mental Health' },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center">
                {i > 0 && (
                  <span className="mx-3 text-xl sm:mx-4" style={{ color: 'var(--metabolic-green)' }}>→</span>
                )}
                <div className="flex flex-col items-center text-center" style={{ minWidth: 72 }}>
                  <span className="text-[34px]">{step.emoji}</span>
                  <span className="mt-1 text-[13px] font-medium leading-tight" style={{ color: 'var(--foreground)' }}>{step.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pull quote */}
      <blockquote
        className="my-8 rounded-2xl border-l-4 px-6 py-5"
        style={{ borderColor: 'var(--metabolic-green)', background: 'var(--metabolic-green-ghost)' }}
      >
        <p className="text-[15px] italic leading-relaxed" style={{ color: 'var(--metabolic-green-dark)' }}>
          &ldquo;Mental disorders are metabolic disorders of the brain.&rdquo;
        </p>
        <cite className="mt-2 block text-sm font-medium not-italic" style={{ color: 'var(--metabolic-green)' }}>
          — Dr. Chris Palmer, Harvard Psychiatrist, Author of Brain Energy
        </cite>
      </blockquote>

      {/* How this connects to tapering */}
      <div
        className="my-8 rounded-2xl border p-6"
        style={{ background: 'var(--purple-ghost)', borderColor: 'var(--purple-pale)' }}
      >
        <h2 className="mb-3 text-lg font-semibold" style={{ fontFamily: 'Fraunces, Georgia, serif', color: 'var(--purple-dark)' }}>
          How this connects to tapering
        </h2>
        <p className="mb-4 text-[15px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          When you taper psychiatric medication, your brain is simultaneously adapting to a changing
          neurochemical environment. Withdrawal symptoms — anxiety, brain fog, insomnia, mood instability —
          are largely a reflection of a brain under metabolic stress. Optimising your metabolic health
          during a taper gives your brain more resources to adapt.
        </p>

        <p className="mt-4 text-[13px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Many community members find that even modest changes — cutting refined sugar, prioritising
          protein, or trying a low-carb approach — noticeably reduce the severity of withdrawal symptoms
          and make their taper more manageable. Diet doesn't replace a carefully managed taper plan, but
          it can make a meaningful difference.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
        <Link
          href="/metabolic/education"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold no-underline transition"
          style={{ background: 'var(--metabolic-green)', color: '#fff' }}
        >
          Learn the science — start here
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
        <Link
          href="/metabolic/diets"
          className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold no-underline transition hover:bg-purple-ghost"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          Which diet fits my taper?
        </Link>
      </div>

      {/* Reference sources */}
      <div className="mt-12 border-t pt-6" style={{ borderColor: 'var(--border-subtle)' }}>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-subtle)' }}>Reference sources</h3>
        <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          <li><a href="https://brainenergybook.com" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--metabolic-green)' }}>Chris Palmer MD — Brain Energy</a></li>
          <li><a href="https://diagnosisdiet.com" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--metabolic-green)' }}>Georgia Ede MD — Diagnosis: Diet</a></li>
          <li><a href="https://metabolicmind.org/about" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--metabolic-green)' }}>Metabolic Mind</a></li>
          <li><a href="https://dietdoctor.com/mental-health" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--metabolic-green)' }}>Diet Doctor — Mental Health Hub</a></li>
        </ul>
      </div>
    </div>
  );
}
