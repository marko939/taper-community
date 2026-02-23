'use client';

import { useState } from 'react';

export default function ProviderPDFButton({ entries = [], profile = {}, assessments = [] }) {
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      // 1. Capture chart images via html2canvas
      setStatus('Capturing charts...');
      const html2canvas = (await import('html2canvas')).default;

      let moodChartImage = null;
      let assessmentChartImage = null;

      // Find the mood chart container (first .recharts-wrapper inside the Dose & Mood card)
      const moodChartEl = document.querySelector('[data-chart="mood"] .recharts-wrapper');
      if (moodChartEl) {
        const canvas = await html2canvas(moodChartEl, { backgroundColor: '#ffffff', scale: 2 });
        moodChartImage = canvas.toDataURL('image/png');
      }

      // Find the assessment chart container
      const assessmentChartEl = document.querySelector('[data-chart="assessment"] .recharts-wrapper');
      if (assessmentChartEl) {
        const canvas = await html2canvas(assessmentChartEl, { backgroundColor: '#ffffff', scale: 2 });
        assessmentChartImage = canvas.toDataURL('image/png');
      }

      // 2. Get AI summary
      setStatus('Generating summary...');
      let summary = '';
      try {
        const res = await fetch('/api/pdf-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entries: entries.map((e) => ({
              date: e.date,
              drug: e.drug,
              current_dose: e.current_dose,
              dose_numeric: e.dose_numeric,
              mood_score: e.mood_score,
              symptoms: e.symptoms,
              notes: e.notes,
            })),
            assessments: assessments.map((a) => ({
              date: a.date,
              type: a.type,
              score: a.score,
            })),
            profile: {
              display_name: profile.display_name,
              drug: profile.drug,
              drug_signature: profile.drug_signature,
            },
          }),
        });
        const data = await res.json();
        summary = data.summary || '';
      } catch (err) {
        console.error('[pdf] AI summary failed:', err);
      }

      // 3. Generate PDF
      setStatus('Building PDF...');
      const [{ pdf }, { default: ProviderPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./ProviderPDF'),
      ]);

      const blob = await pdf(
        <ProviderPDF
          entries={entries}
          profile={profile}
          assessments={assessments}
          summary={summary}
          moodChartImage={moodChartImage}
          assessmentChartImage={assessmentChartImage}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taper-report-${profile.display_name || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[pdf] Generation failed:', err);
    }
    setStatus('');
    setGenerating(false);
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={generating}
      className="btn-secondary text-sm disabled:opacity-50"
    >
      {generating ? (status || 'Generating...') : 'Send to Provider'}
    </button>
  );
}
