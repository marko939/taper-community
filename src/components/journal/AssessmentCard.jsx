'use client';

import { useState } from 'react';
import { labelPHQ, labelGAD, severityColor } from '@/lib/assessments';
import AssessmentForm from './AssessmentForm';

export default function AssessmentCard({ assessments }) {
  const [activeForm, setActiveForm] = useState(null); // 'phq9' | 'gad7' | null

  const latestPHQ = assessments.find((a) => a.type === 'phq9');
  const latestGAD = assessments.find((a) => a.type === 'gad7');

  if (activeForm) {
    return (
      <AssessmentForm
        type={activeForm}
        onComplete={() => setActiveForm(null)}
        onCancel={() => setActiveForm(null)}
      />
    );
  }

  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}>
      <h3 className="mb-3 text-sm font-semibold text-foreground">Mental Health Check-In</h3>
      <p className="mb-4 text-xs text-text-subtle">
        Standardized assessments to track depression and anxiety over time.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* PHQ-9 */}
        <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">PHQ-9</p>
            {latestPHQ && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                style={{ background: severityColor(labelPHQ(latestPHQ.score)) }}
              >
                {labelPHQ(latestPHQ.score)}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[10px] text-text-subtle">Depression</p>
          {latestPHQ ? (
            <p className="mt-1 text-lg font-bold" style={{ color: severityColor(labelPHQ(latestPHQ.score)) }}>
              {latestPHQ.score}<span className="text-xs font-normal text-text-subtle">/27</span>
            </p>
          ) : (
            <p className="mt-1 text-xs text-text-subtle">Not taken yet</p>
          )}
          <button
            onClick={() => setActiveForm('phq9')}
            className="btn btn-primary mt-2 w-full py-1.5 text-xs"
          >
            {latestPHQ ? 'Retake PHQ-9' : 'Take PHQ-9'}
          </button>
        </div>

        {/* GAD-7 */}
        <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">GAD-7</p>
            {latestGAD && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                style={{ background: severityColor(labelGAD(latestGAD.score)) }}
              >
                {labelGAD(latestGAD.score)}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[10px] text-text-subtle">Anxiety</p>
          {latestGAD ? (
            <p className="mt-1 text-lg font-bold" style={{ color: severityColor(labelGAD(latestGAD.score)) }}>
              {latestGAD.score}<span className="text-xs font-normal text-text-subtle">/21</span>
            </p>
          ) : (
            <p className="mt-1 text-xs text-text-subtle">Not taken yet</p>
          )}
          <button
            onClick={() => setActiveForm('gad7')}
            className="btn btn-primary mt-2 w-full py-1.5 text-xs"
          >
            {latestGAD ? 'Retake GAD-7' : 'Take GAD-7'}
          </button>
        </div>
      </div>

      {(latestPHQ || latestGAD) && (
        <p className="mt-3 text-[10px] text-text-subtle">
          Last taken: {latestPHQ && `PHQ-9 on ${new Date(latestPHQ.date).toLocaleDateString()}`}
          {latestPHQ && latestGAD && ' · '}
          {latestGAD && `GAD-7 on ${new Date(latestGAD.date).toLocaleDateString()}`}
        </p>
      )}
    </div>
  );
}
