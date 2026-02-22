'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getDrugsByClass } from '@/lib/drugs';
import { DRUG_CATEGORY_GROUPS } from '@/lib/constants';

const CATEGORY_ICONS = {
  SSRI: (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  SNRI: (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  Benzo: (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  ),
  TCA: (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Antipsychotic: (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
  Other: (
    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function DrugsIndexPage() {
  const drugsByClass = getDrugsByClass();
  const [expanded, setExpanded] = useState(null);

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

      <div className="grid grid-cols-3 gap-4">
        {DRUG_CATEGORY_GROUPS.map((cat) => {
          const drugs = cat.classes.flatMap((c) => drugsByClass[c] || []);
          const isExpanded = expanded === cat.key;

          return (
            <div key={cat.key} className="flex flex-col">
              <button
                onClick={() => setExpanded(isExpanded ? null : cat.key)}
                className="group flex flex-col items-center gap-3 rounded-2xl border p-5 transition hover:border-purple hover:shadow-elevated"
                style={{
                  borderColor: isExpanded ? 'var(--purple)' : 'var(--border-subtle)',
                  background: isExpanded ? 'var(--purple-ghost)' : 'var(--surface-strong)',
                }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-110"
                  style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
                >
                  {CATEGORY_ICONS[cat.key]}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{cat.label}</p>
                  <p className="mt-0.5 text-[11px] text-text-subtle">{cat.desc}</p>
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
                >
                  {drugs.length} {drugs.length === 1 ? 'drug' : 'drugs'}
                </span>
              </button>

              {isExpanded && (
                <div className="mt-2 space-y-1">
                  {drugs.map((drug) => (
                    <Link
                      key={drug.slug}
                      href={`/drugs/${drug.slug}`}
                      className="group flex items-center gap-3 rounded-xl border px-4 py-3 no-underline transition hover:border-purple hover:bg-purple-ghost/50"
                      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground transition group-hover:text-purple">
                          {drug.name}
                        </p>
                        <p className="text-[11px] text-text-subtle">{drug.generic}</p>
                      </div>
                      <svg
                        className="h-4 w-4 shrink-0 text-text-subtle transition group-hover:text-purple"
                        fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
