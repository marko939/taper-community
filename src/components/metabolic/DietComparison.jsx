'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { DIETS } from '@/lib/metabolic/diets';
import EvidenceBadge from './EvidenceBadge';
import TaperingFitBadge from './TaperingFitBadge';

const DIET_EMOJIS = {
  ketogenic: '🥑',
  'low-carb': '🥩',
  'anti-inflammatory': '🫐',
  carnivore: '🍖',
};

function DetailPanel({ diet }) {
  if (!diet || !diet.details) return null;
  return (
    <div
      className="mt-4 rounded-2xl border p-4 sm:p-6"
      style={{ background: 'var(--surface-strong)', borderColor: 'var(--purple-pale)' }}
    >
      <h2
        className="mb-4 text-xl font-bold"
        style={{ fontFamily: 'Fraunces, Georgia, serif', color: 'var(--foreground)' }}
      >
        {DIET_EMOJIS[diet.slug]} {diet.name}
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>What is it?</h3>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{diet.details.what}</p>
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>How does it work?</h3>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{diet.details.mechanism}</p>
        </div>
        <div
          className="rounded-xl border-l-4 px-4 py-3"
          style={{ borderColor: 'var(--metabolic-green)', background: 'var(--metabolic-green-ghost)' }}
        >
          <h3 className="text-sm font-bold" style={{ color: 'var(--metabolic-green-dark)' }}>Relevance to tapering</h3>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--metabolic-green-dark)' }}>{diet.details.tapering}</p>
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Things to consider</h3>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{diet.details.considerations}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/metabolic/food-guides/${diet.slug}`}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold no-underline transition"
          style={{ background: 'var(--metabolic-green)', color: '#fff' }}
        >
          View food guide
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
        <Link
          href={`/tools/meal-generator?diet=${diet.slug}`}
          className="inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium no-underline transition hover:bg-purple-ghost"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          Generate a meal idea
        </Link>
      </div>
    </div>
  );
}

const ROWS = [DIETS.slice(0, 2), DIETS.slice(2, 4)];

export default function DietComparison() {
  const [selected, setSelected] = useState(null);
  const detailRefs = useRef({});

  const handleSelect = useCallback((slug) => {
    const next = selected === slug ? null : slug;
    setSelected(next);
    if (next) {
      // Scroll to detail panel after React renders it
      setTimeout(() => {
        detailRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }, [selected]);

  return (
    <div>
      <h1
        className="text-2xl font-bold sm:text-3xl"
        style={{ fontFamily: 'Fraunces, Georgia, serif', color: 'var(--foreground)' }}
      >
        Diet Approaches
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Four dietary approaches with varying levels of evidence for supporting mental health and medication tapering.
        Select one to learn how it works and why it may help during your taper.
      </p>

      {/* ── Mobile: flat list, detail inline after each tile ── */}
      <div className="mt-8 space-y-4 sm:hidden">
        {DIETS.map((diet) => {
          const isActive = selected === diet.slug;
          return (
            <div key={diet.slug}>
              <button
                onClick={() => handleSelect(diet.slug)}
                className="flex w-full flex-col items-center justify-center rounded-2xl border p-4 text-center transition"
                style={{
                  minHeight: 180,
                  background: isActive ? 'var(--purple-ghost)' : 'var(--surface-strong)',
                  borderColor: isActive ? 'var(--purple)' : 'var(--border-subtle)',
                  borderWidth: isActive ? 2 : 1,
                }}
              >
                <span className="text-5xl">{DIET_EMOJIS[diet.slug] || '🥗'}</span>
                <span
                  className="mt-3 text-base font-bold leading-tight"
                  style={{ color: isActive ? 'var(--purple-dark)' : 'var(--foreground)' }}
                >
                  {diet.name}
                </span>
                <span className="mt-2 text-[12px] leading-snug" style={{ color: 'var(--text-muted)' }}>
                  {diet.description}
                </span>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  <EvidenceBadge level={diet.evidence} />
                  <TaperingFitBadge level={diet.taperingFit} />
                </div>
              </button>
              {isActive && (
                <div ref={(el) => { detailRefs.current[diet.slug] = el; }}>
                  <DetailPanel diet={diet} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Desktop: 2-column rows with detail below row ── */}
      <div className="mt-8 hidden space-y-4 sm:block">
        {ROWS.map((row, rowIdx) => {
          const active = row.find((d) => d.slug === selected);
          return (
            <div key={rowIdx}>
              <div className="grid grid-cols-2 gap-4">
                {row.map((diet) => {
                  const isActive = selected === diet.slug;
                  return (
                    <button
                      key={diet.slug}
                      onClick={() => handleSelect(diet.slug)}
                      className="flex flex-col items-center justify-center rounded-2xl border p-6 text-center transition"
                      style={{
                        aspectRatio: '1 / 1',
                        background: isActive ? 'var(--purple-ghost)' : 'var(--surface-strong)',
                        borderColor: isActive ? 'var(--purple)' : 'var(--border-subtle)',
                        borderWidth: isActive ? 2 : 1,
                      }}
                    >
                      <span className="text-5xl">{DIET_EMOJIS[diet.slug] || '🥗'}</span>
                      <span
                        className="mt-3 text-base font-bold leading-tight"
                        style={{ color: isActive ? 'var(--purple-dark)' : 'var(--foreground)' }}
                      >
                        {diet.name}
                      </span>
                      <span className="mt-2 text-[12px] leading-snug" style={{ color: 'var(--text-muted)' }}>
                        {diet.description}
                      </span>
                      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                        <EvidenceBadge level={diet.evidence} />
                        <TaperingFitBadge level={diet.taperingFit} />
                      </div>
                    </button>
                  );
                })}
              </div>
              {active && (
                <div ref={(el) => { detailRefs.current[active.slug] = el; }}>
                  <DetailPanel diet={active} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sources */}
      <div className="mt-10 border-t pt-6" style={{ borderColor: 'var(--border-subtle)' }}>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-subtle)' }}>Reference sources</h3>
        <ul className="space-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          <li><a href="https://metabolicmind.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--metabolic-green)' }}>Metabolic Mind</a></li>
          <li><a href="https://dietdoctor.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--metabolic-green)' }}>Diet Doctor</a></li>
          <li><a href="https://diagnosisdiet.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--metabolic-green)' }}>Georgia Ede — Diagnosis: Diet</a></li>
          <li><a href="https://brainenergybook.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--metabolic-green)' }}>Chris Palmer — Brain Energy</a></li>
        </ul>
      </div>
    </div>
  );
}
