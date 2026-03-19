'use client';

import Link from 'next/link';
import JournalChart from '@/components/journal/JournalChart';

export default function ShareClient({ share }) {
  const snap = share.journey_snapshot;
  const profile = snap?.profile || {};
  const entries = snap?.entries || [];
  const drug = profile.drug || 'medication';
  const name = profile.display_name || 'A TaperCommunity member';
  const isClinical = share.share_context === 'clinical';

  // Calculate taper stats
  const doses = entries.filter((e) => e.dose_numeric).map((e) => e.dose_numeric);
  const startDose = doses.length > 0 ? doses[doses.length - 1] : null;
  const currentDose = doses.length > 0 ? doses[0] : null;
  const firstDate = entries.length > 0 ? entries[entries.length - 1].date : null;
  const lastDate = entries.length > 0 ? entries[0].date : null;
  const weeksActive = firstDate && lastDate
    ? Math.max(1, Math.round((new Date(lastDate) - new Date(firstDate)) / (7 * 24 * 60 * 60 * 1000)))
    : 0;

  const caption = startDose && currentDose
    ? `Week ${weeksActive} — ${startDose}mg → ${currentDose}mg ${drug}`
    : `${drug} taper — ${entries.length} entries`;

  // Entries need to be sorted ascending for JournalChart
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--purple)' }}>
          Shared Taper Journey
        </p>
        <h1 className="mt-2 font-serif text-xl font-semibold text-foreground sm:text-2xl">
          {name}&apos;s {drug} Taper
        </h1>
        <p className="mt-1 text-sm font-medium" style={{ color: 'var(--purple)' }}>{caption}</p>
      </div>

      {/* Chart */}
      {entries.length > 0 && (
        <div className="rounded-2xl border p-4 sm:p-6" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}>
          <JournalChart entries={sortedEntries} assessments={[]} />
        </div>
      )}

      {/* Stats row */}
      {startDose && currentDose && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}>
            <p className="text-lg font-bold" style={{ color: 'var(--purple)' }}>{startDose}mg</p>
            <p className="text-[10px] text-text-subtle">Starting dose</p>
          </div>
          <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}>
            <p className="text-lg font-bold" style={{ color: 'var(--accent-teal)' }}>{currentDose}mg</p>
            <p className="text-[10px] text-text-subtle">Current dose</p>
          </div>
          <div className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}>
            <p className="text-lg font-bold text-foreground">{weeksActive}</p>
            <p className="text-[10px] text-text-subtle">Weeks</p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div
        className="rounded-2xl p-6 text-center sm:p-8"
        style={{ background: 'linear-gradient(135deg, var(--purple-ghost), var(--surface-strong))' }}
      >
        {isClinical ? (
          <>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Are you a prescriber supporting someone through a taper?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
              TaperCommunity helps you stay connected with your patients between appointments.
              Evidence-based tapering protocols, patient progress charts, and clinical reports.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/deprescribers" className="btn btn-primary text-sm no-underline">
                Learn More
              </Link>
              <Link href="/auth/signup" className="btn btn-secondary text-sm no-underline">
                Create Free Account
              </Link>
            </div>

            {/* TaperMeds promo — only shown on clinical share pages (prescriber audience) */}
            <div
              className="mx-auto mt-6 max-w-sm rounded-xl border p-4"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
            >
              <p className="text-xs font-semibold" style={{ color: 'var(--purple)' }}>For prescribers</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                Get autopilot for deprescribing
              </p>
              <p className="mt-1 text-xs text-text-muted">
                TaperMeds gives you AI-powered deprescribing protocols, automated patient monitoring,
                and clinical decision support — so your patients taper safely without the guesswork.
              </p>
              <a
                href="https://tapermeds.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block rounded-lg px-4 py-2 text-xs font-semibold text-white no-underline transition hover:opacity-90"
                style={{ background: 'var(--purple)' }}
              >
                Learn about TaperMeds
              </a>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Supporting someone through a taper?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
              Join TaperCommunity to understand their journey and connect with others
              who are supporting loved ones through medication tapering.
            </p>
            <div className="mt-5">
              <Link href="/auth/signup" className="btn btn-primary text-sm no-underline">
                Join TaperCommunity — Free
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-text-subtle">
          Shared via{' '}
          <Link href="/" className="font-medium" style={{ color: 'var(--purple)' }}>
            taper.community
          </Link>
        </p>
      </div>
    </div>
  );
}
