'use client';

import { useRef, useState } from 'react';
import MilestoneCard from './MilestoneCard';
import { getShareableText } from '@/lib/milestones';

export default function MilestoneShareModal({ milestone, profile, entries, onClose }) {
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  const shareText = getShareableText(milestone, profile, entries);

  const handleShare = async () => {
    setSharing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setSharing(false);
          return;
        }

        const file = new File([blob], 'milestone.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              title: shareText,
              text: `${shareText} — TaperCommunity`,
              files: [file],
            });
          } catch {
            downloadBlob(blob);
          }
        } else {
          downloadBlob(blob);
        }
        setSharing(false);
      }, 'image/png');
    } catch (err) {
      console.error('[milestone] Share failed:', err);
      setSharing(false);
    }
  };

  const downloadBlob = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'milestone.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-text-subtle hover:text-foreground"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="mb-4 text-lg font-semibold text-foreground">
          {milestone.emoji} Milestone Achieved!
        </h3>

        <div className="mb-4 flex justify-center">
          <MilestoneCard
            milestone={milestone}
            shareText={shareText}
            entries={entries}
            cardRef={cardRef}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleShare}
            disabled={sharing}
            className="btn btn-primary flex-1 text-sm disabled:opacity-50"
          >
            {sharing ? 'Generating...' : 'Share'}
          </button>
          <button onClick={onClose} className="btn btn-secondary flex-1 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
