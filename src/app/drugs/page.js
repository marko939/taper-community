'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getDrugsByClass } from '@/lib/drugs';

const CLASS_DESCRIPTIONS = {
  SSRI: 'Selective serotonin reuptake inhibitors — the most commonly prescribed antidepressants.',
  SNRI: 'Serotonin-norepinephrine reuptake inhibitors — dual-action antidepressants.',
  TCA: 'Tricyclic antidepressants — older-generation antidepressants with broader receptor activity.',
  NaSSA: 'Noradrenergic and specific serotonergic antidepressants.',
  NDRI: 'Norepinephrine-dopamine reuptake inhibitors.',
  'Atypical Antipsychotic': 'Second-generation antipsychotics used for psychosis, bipolar, and as adjuncts.',
  Benzodiazepine: 'GABA-A receptor modulators for anxiety, insomnia, and seizures.',
  Gabapentinoid: 'Alpha-2-delta calcium channel modulators for pain and seizures.',
  Other: 'Other psychiatric medications including mood stabilizers and anticonvulsants.',
};

function PillIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 1.5L3 9a4.243 4.243 0 006 6l7.5-7.5a4.243 4.243 0 00-6-6z" />
      <line x1="6.75" y1="6.75" x2="13.25" y2="13.25" />
    </svg>
  );
}

export default function DrugsIndexPage() {
  const drugsByClass = getDrugsByClass();
  const [expanded, setExpanded] = useState({});

  const toggle = (className) => {
    setExpanded((prev) => ({ ...prev, [className]: !prev[className] }));
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="section-eyebrow">Drug Profiles</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
          Medication Guide
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-muted">
          Detailed pharmacological profiles, tapering guidance, and safety information
          for 27 psychiatric medications. Tap a category to explore.
        </p>
      </div>

      <div className="space-y-3">
        {Object.entries(drugsByClass).map(([className, drugs]) => (
          <div key={className} className="glass-panel overflow-hidden">
            <button
              onClick={() => toggle(className)}
              className="flex w-full items-center gap-3 px-6 py-4 text-left transition hover:bg-purple-ghost/50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-purple" style={{ background: 'var(--purple-pale)' }}>
                <PillIcon />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-foreground">{className}</h2>
                {CLASS_DESCRIPTIONS[className] && (
                  <p className="mt-0.5 text-xs text-text-subtle line-clamp-1">{CLASS_DESCRIPTIONS[className]}</p>
                )}
              </div>
              <span
                className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
                style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
              >
                {drugs.length}
              </span>
              <svg
                className={`h-4 w-4 shrink-0 text-text-subtle transition-transform ${expanded[className] ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {expanded[className] && (
              <div className="border-t grid gap-px bg-border-subtle sm:grid-cols-2 lg:grid-cols-3" style={{ borderColor: 'var(--border-subtle)' }}>
                {drugs.map((drug) => (
                  <Link
                    key={drug.slug}
                    href={`/drugs/${drug.slug}`}
                    className="group flex items-center gap-3 bg-surface-strong px-5 py-4 no-underline transition hover:bg-purple-ghost/50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-purple" style={{ background: 'var(--purple-pale)' }}>
                      <PillIcon />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground transition group-hover:text-purple">
                        {drug.name}
                      </p>
                      <p className="text-xs text-text-subtle">{drug.generic}</p>
                    </div>
                    <svg
                      className="ml-auto h-4 w-4 shrink-0 text-text-subtle transition group-hover:text-purple"
                      fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
