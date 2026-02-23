'use client';

import { useState } from 'react';

export default function ProviderPDFButton({ entries = [], profile = {}, assessments = [] }) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const [{ pdf }, { default: ProviderPDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./ProviderPDF'),
      ]);

      const blob = await pdf(
        <ProviderPDF entries={entries} profile={profile} assessments={assessments} />
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
    setGenerating(false);
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={generating}
      className="btn-secondary text-sm disabled:opacity-50"
    >
      {generating ? 'Generating PDF...' : 'Send to Provider'}
    </button>
  );
}
