'use client';

import { useState } from 'react';
import { PHQ9_ITEMS, GAD7_ITEMS, FREQ_CHOICES, labelPHQ, labelGAD, severityColor } from '@/lib/assessments';
import { useAssessmentStore } from '@/stores/assessmentStore';

export default function AssessmentForm({ type, onComplete, onCancel }) {
  const items = type === 'phq9' ? PHQ9_ITEMS : GAD7_ITEMS;
  const label = type === 'phq9' ? 'PHQ-9' : 'GAD-7';
  const subtitle = type === 'phq9' ? 'Depression Severity' : 'Anxiety Severity';
  const labelFn = type === 'phq9' ? labelPHQ : labelGAD;

  const [responses, setResponses] = useState(Array(items.length).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const submitAssessment = useAssessmentStore((s) => s.submitAssessment);

  const answered = responses.filter((r) => r !== null).length;
  const allAnswered = answered === items.length;

  const setResponse = (idx, value) => {
    setResponses((prev) => prev.map((v, i) => (i === idx ? value : v)));
  };

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    const score = responses.reduce((a, b) => a + b, 0);
    const data = await submitAssessment({ type, score, responses });
    if (data) {
      setResult({ score, severity: labelFn(score) });
    }
    setSubmitting(false);
  };

  if (result) {
    const color = severityColor(result.severity);
    return (
      <div className="rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}>
        <p className="text-sm font-medium text-text-muted">{label} Score</p>
        <p className="mt-2 text-4xl font-bold" style={{ color }}>
          {result.score}
        </p>
        <span
          className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ background: color }}
        >
          {result.severity}
        </span>
        <p className="mt-3 text-xs text-text-subtle">
          {type === 'phq9' ? `Out of 27` : `Out of 21`}
        </p>
        <button
          onClick={() => onComplete?.()}
          className="btn btn-primary mt-4 text-sm"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{label} — {subtitle}</h3>
          <p className="mt-0.5 text-xs text-text-subtle">
            Over the last 2 weeks, how often have you been bothered by the following?
          </p>
        </div>
        <button onClick={onCancel} className="btn btn-secondary text-xs">
          Cancel
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx}>
            <p className="mb-2 text-sm text-foreground">
              <span className="font-medium text-text-subtle">{idx + 1}.</span> {item}
            </p>
            <div className="flex flex-wrap gap-2">
              {FREQ_CHOICES.map((choice) => (
                <button
                  key={choice.value}
                  onClick={() => setResponse(idx, choice.value)}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium transition"
                  style={{
                    borderColor: responses[idx] === choice.value ? 'var(--purple)' : 'var(--border-subtle)',
                    background: responses[idx] === choice.value ? 'var(--purple-ghost)' : 'transparent',
                    color: responses[idx] === choice.value ? 'var(--purple)' : 'var(--text-muted)',
                  }}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-text-subtle">{answered}/{items.length} answered</p>
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="btn btn-primary text-sm disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
