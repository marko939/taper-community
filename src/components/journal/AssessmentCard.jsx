'use client';

import { useState } from 'react';
import AssessmentForm from './AssessmentForm';

export default function AssessmentCard({ assessments }) {
  const [activeForm, setActiveForm] = useState(null); // 'phq9' | 'gad7' | null

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
        <button
          onClick={() => setActiveForm('phq9')}
          className="btn btn-primary w-full py-3 text-sm"
        >
          Take Standardized Depression Test
        </button>
        <button
          onClick={() => setActiveForm('gad7')}
          className="btn btn-primary w-full py-3 text-sm"
        >
          Take Standardized Anxiety Test
        </button>
      </div>
    </div>
  );
}
