'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getDrugsByClass } from '@/lib/drugs';
import { DRUG_CATEGORY_GROUPS } from '@/lib/constants';
import { DRUG_CLASS_ICONS as CATEGORY_ICONS } from '@/lib/forumCategories';

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
