'use client';

import { useState } from 'react';
import GuideDownloadModal from './GuideDownloadModal';

export default function GuideDownloadCTA({ variant = 'default' }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        className={`rounded-2xl border p-6 ${variant === 'inline' ? '' : 'sm:p-8'}`}
        style={{
          borderColor: 'var(--purple-pale)',
          background: 'linear-gradient(135deg, var(--purple-ghost), var(--surface-strong))',
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Free: Taper Preparation Guide</h3>
              <p className="mt-1 text-xs text-text-muted">
                12-page readiness self-assessment with 20 questions for your clinician and evidence-based tapering principles.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--purple), var(--purple-light))' }}
          >
            Download Free Guide
          </button>
        </div>
      </div>

      {showModal && <GuideDownloadModal onClose={() => setShowModal(false)} />}
    </>
  );
}
