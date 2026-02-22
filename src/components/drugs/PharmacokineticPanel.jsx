'use client';

import { useState } from 'react';

const ADME_SECTIONS = [
  {
    key: 'absorption',
    label: 'Absorption',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    key: 'volumeOfDistribution',
    label: 'Distribution',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    key: 'metabolism',
    label: 'Metabolism',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    key: 'routeOfElimination',
    label: 'Elimination',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5-6L16.5 15m0 0L12 10.5M16.5 15V1.5" />
      </svg>
    ),
  },
];

export default function PharmacokineticPanel({ drug }) {
  const hasData = ADME_SECTIONS.some((s) => drug[s.key]);
  if (!hasData) return null;

  return (
    <div className="glass-panel overflow-hidden">
      <div className="border-b border-border-subtle px-6 py-4">
        <p className="section-eyebrow">Pharmacokinetics</p>
        <h2 className="mt-1 font-serif text-xl font-semibold text-foreground">ADME Profile</h2>
      </div>

      <div className="grid gap-px bg-border-subtle sm:grid-cols-2 lg:grid-cols-4">
        {ADME_SECTIONS.map((section) => {
          const value = drug[section.key];
          if (!value) return null;

          return (
            <div key={section.key} className="bg-surface-strong p-5">
              <div className="mb-3 flex items-center gap-2 text-purple">
                {section.icon}
                <span className="text-xs font-bold uppercase tracking-wider">{section.label}</span>
              </div>
              <p className="text-sm leading-relaxed text-text-muted">{value}</p>
            </div>
          );
        })}
      </div>

      {(drug.proteinBinding || drug.clearance) && (
        <div className="border-t border-border-subtle bg-purple-ghost/50 px-6 py-4">
          <div className="flex flex-wrap gap-6">
            {drug.proteinBinding && (
              <div>
                <span className="text-xs font-semibold text-text-subtle">Protein Binding</span>
                <p className="mt-0.5 text-sm font-medium text-foreground">{drug.proteinBinding}</p>
              </div>
            )}
            {drug.clearance && (
              <div>
                <span className="text-xs font-semibold text-text-subtle">Clearance</span>
                <p className="mt-0.5 text-sm font-medium text-foreground">{drug.clearance}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
