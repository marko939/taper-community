'use client';

import { useState, useEffect } from 'react';
import AILabel from '@/components/shared/AILabel';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AISidebar({ threadId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!threadId) return;

    const fetchSummary = async () => {
      try {
        const res = await fetch(`/api/ai-summary?threadId=${threadId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
      } catch {
        setError(true);
      }
      setLoading(false);
    };

    fetchSummary();
  }, [threadId]);

  if (loading) {
    return (
      <div className="card">
        <LoadingSpinner className="py-8" />
        <p className="mt-2 text-center text-xs text-text-subtle">Loading clinical context...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <AILabel>
        <p className="text-sm text-text-muted">
          Unable to load AI context at this time. Always consult your clinician
          before making medication changes.
        </p>
      </AILabel>
    );
  }

  return (
    <AILabel className="sticky top-20">
      {data.summary && (
        <div className="mb-4">
          <h3 className="mb-1.5 text-sm font-semibold text-foreground">Clinical Context</h3>
          <p className="text-sm leading-relaxed text-text-muted">{data.summary}</p>
        </div>
      )}

      {data.guidelines && (
        <div className="mb-4">
          <h3 className="mb-1.5 text-sm font-semibold text-foreground">From Clinical Guidelines</h3>
          <p className="text-sm leading-relaxed text-text-muted">{data.guidelines}</p>
        </div>
      )}

      {data.similarTopics?.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-1.5 text-sm font-semibold text-foreground">Related Topics</h3>
          <ul className="space-y-1">
            {data.similarTopics.map((topic, i) => (
              <li key={i} className="text-sm text-accent-blue">
                &bull; {topic}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-amber-500/20 bg-amber-50/50 p-3">
        <p className="text-xs leading-relaxed text-amber-700">
          {data.clinicianPrompt || 'Always discuss medication changes with your prescriber.'}
        </p>
      </div>
    </AILabel>
  );
}
