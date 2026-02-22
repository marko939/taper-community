'use client';

import { useState } from 'react';
import Link from 'next/link';
import Badge from '@/components/shared/Badge';
import PharmacokineticPanel from '@/components/drugs/PharmacokineticPanel';

function ExpandableList({ title, items, variant = 'default' }) {
  const [expanded, setExpanded] = useState(false);
  if (!items || items.length === 0) return null;

  const visibleItems = expanded ? items : items.slice(0, 3);
  const hasMore = items.length > 3;

  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-foreground">{title}</h4>
      <ul className="space-y-1.5">
        {visibleItems.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                variant === 'danger' ? 'bg-accent-red' : variant === 'warning' ? 'bg-accent-warn' : 'bg-purple-light'
              }`}
            />
            {item}
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-semibold text-purple hover:text-purple-light"
        >
          {expanded ? 'Show less' : `Show ${items.length - 3} more`}
        </button>
      )}
    </div>
  );
}

function KeyFact({ label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-purple/15 bg-white px-4 py-3" style={{ boxShadow: 'var(--shadow-soft)' }}>
      <span className="text-xs font-semibold text-purple">{label}</span>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export default function DrugProfileCard({ drug }) {
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="glass-panel overflow-hidden">
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, var(--purple), var(--purple-light))` }} />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                {drug.name}
              </h1>
              <p className="mt-1 text-lg text-text-muted">{drug.generic}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge>{drug.class}</Badge>
                {drug.fdaApprovalYear && (
                  <Badge variant="gray">FDA {drug.fdaApprovalYear}</Badge>
                )}
              </div>
            </div>
            <Link
              href={`/forums/${drug.slug}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white no-underline transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--purple), var(--purple-light))' }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              Go to Community Forum
            </Link>
          </div>

          {/* Black Box Warning */}
          {drug.blackBoxWarning && (
            <div className="mt-6 rounded-xl border border-accent-red/30 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-accent-red" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-accent-red">Boxed Warning</p>
                  <p className="mt-1 text-sm leading-relaxed text-red-800">{drug.blackBoxWarning}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Overview ── */}
      {drug.description && (
        <div className="glass-panel p-6 sm:p-8">
          <p className="section-eyebrow">Overview</p>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">{drug.description}</p>
        </div>
      )}

      {/* ── Key Facts Grid ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <KeyFact label="Common Doses" value={drug.commonDoses} />
        <KeyFact
          label="Formulations"
          value={drug.availableFormulations ? drug.availableFormulations.join('; ') : null}
        />
        <KeyFact label="Pregnancy" value={drug.pregnancyCategory} />
      </div>

      {/* ── Mechanism of Action ── */}
      {drug.mechanismOfAction && (
        <div className="glass-panel overflow-hidden">
          <div className="border-l-4 border-purple p-6 sm:p-8">
            <p className="section-eyebrow">Mechanism of Action</p>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">{drug.mechanismOfAction}</p>
          </div>
        </div>
      )}

      {/* ── Taper Notes + Maudsley ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-6">
          <p className="section-eyebrow">Taper Notes</p>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">{drug.taperNotes}</p>
        </div>

        <div className="glass-panel overflow-hidden border-purple/20">
          <div className="border-l-4 border-purple p-6">
            <p className="section-eyebrow text-purple">Maudsley Deprescribing Guidance</p>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">{drug.maudsleyGuidance}</p>
          </div>
        </div>
      </div>

      {/* ── Withdrawal Symptoms ── */}
      <div className="glass-panel p-6 sm:p-8">
        <p className="section-eyebrow">Common Withdrawal Symptoms</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {drug.withdrawalSymptoms.map((symptom) => {
            const isSevere = /severe|seizure|psychosis/i.test(symptom);
            const isModerate = /depersonalization|rage|electric/i.test(symptom);
            return (
              <span
                key={symptom}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  isSevere
                    ? 'bg-red-100 text-red-700'
                    : isModerate
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-purple-pale text-purple'
                }`}
              >
                {symptom}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Interactions & Safety ── */}
      {(drug.drugInteractions || drug.foodInteractions || drug.contraindications) && (
        <div className="glass-panel p-6 sm:p-8">
          <p className="section-eyebrow">Interactions &amp; Safety</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ExpandableList title="Drug Interactions" items={drug.drugInteractions} variant="danger" />
            <ExpandableList title="Food Interactions" items={drug.foodInteractions} variant="warning" />
            <ExpandableList title="Contraindications" items={drug.contraindications} variant="danger" />
          </div>
        </div>
      )}

      {/* ── Toxicity ── */}
      {drug.toxicity && (
        <div className="rounded-xl border border-accent-warn/30 bg-amber-50/50 p-5">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-accent-warn" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Toxicity</p>
              <p className="mt-1 text-sm leading-relaxed text-amber-900">{drug.toxicity}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Pharmacokinetics (ADME) — at bottom ── */}
      <PharmacokineticPanel drug={drug} />
    </div>
  );
}
