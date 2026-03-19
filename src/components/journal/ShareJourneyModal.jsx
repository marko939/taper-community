'use client';

import { useState, useEffect, useRef } from 'react';
import { useJournalStore } from '@/stores/journalStore';
import { useAuthStore } from '@/stores/authStore';

export default function ShareJourneyModal({ mode, entries, profile, assessments, onClose }) {
  const [imageBlob, setImageBlob] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);
  const [capturing, setCapturing] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const createSharedJourney = useJournalStore((s) => s.createSharedJourney);
  const getShareLink = useJournalStore((s) => s.getShareLink);

  // Auto-caption
  const drug = profile?.drug || 'medication';
  const doses = entries.filter((e) => e.dose_numeric).map((e) => e.dose_numeric);
  const startDose = doses.length > 0 ? doses[doses.length - 1] : null;
  const currentDose = doses.length > 0 ? doses[0] : null;
  const totalEntries = entries.length;
  const firstDate = entries.length > 0 ? entries[entries.length - 1].date : null;
  const lastDate = entries.length > 0 ? entries[0].date : null;
  const weeksActive = firstDate && lastDate
    ? Math.max(1, Math.round((new Date(lastDate) - new Date(firstDate)) / (7 * 24 * 60 * 60 * 1000)))
    : 0;
  const caption = startDose && currentDose
    ? `Week ${weeksActive} — ${startDose}mg → ${currentDose}mg ${drug}`
    : `${drug} taper — ${totalEntries} entries`;

  // Capture chart on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const chartEl = document.querySelector('[data-chart="mood"]');
        if (!chartEl) { setCapturing(false); return; }

        // Inject branded overlay
        const overlay = document.createElement('div');
        overlay.setAttribute('data-share-overlay', 'true');
        overlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:100;';
        overlay.innerHTML = `
          <div style="position:absolute;top:8px;left:12px;font-family:DM Sans,sans-serif;font-size:13px;font-weight:700;color:#5B2E91;">${caption}</div>
          <div style="position:absolute;bottom:6px;right:10px;font-family:DM Sans,sans-serif;font-size:10px;color:#9B95A8;opacity:0.8;">taper.community</div>
        `;
        chartEl.style.position = 'relative';
        chartEl.appendChild(overlay);

        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(chartEl, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
        });

        // Clean up overlay
        chartEl.removeChild(overlay);

        if (cancelled) return;

        canvas.toBlob((blob) => {
          if (!blob || cancelled) return;
          setImageBlob(blob);
          setImageUrl(URL.createObjectURL(blob));
          setCapturing(false);
        }, 'image/png');
      } catch (err) {
        console.error('[ShareJourney] Capture failed:', err);
        if (!cancelled) setCapturing(false);
      }
    })();
    return () => { cancelled = true; };
  }, [caption]);

  const [linkError, setLinkError] = useState(false);

  // Create shareable link with timeout — returns URL or null
  const handleCreateLink = async () => {
    if (shareUrl) return shareUrl;
    if (creating) return null;
    setCreating(true);
    setLinkError(false);

    const timeout = (promise, ms) => Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
    ]);

    try {
      const id = await timeout(
        createSharedJourney(mode === 'clinical' ? 'clinical' : 'personal'),
        8000
      );
      if (id) {
        const url = `${window.location.origin}/share/${id}`;
        setShareUrl(url);
        setCreating(false);
        return url;
      }
    } catch (err) {
      console.warn('[ShareJourney] shared_journeys failed:', err.message);
    }

    try {
      const token = await timeout(getShareLink(), 5000);
      if (token) {
        const url = `${window.location.origin}/journal/${token}`;
        setShareUrl(url);
        setCreating(false);
        return url;
      }
    } catch (err) {
      console.warn('[ShareJourney] fallback failed:', err.message);
    }

    setLinkError(true);
    setCreating(false);
    return null;
  };

  // Try to create link on mount
  useEffect(() => {
    handleCreateLink();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyLink = async () => {
    let url = shareUrl;
    if (!url && !creating && !linkError) {
      url = await handleCreateLink();
    }
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyImage = async () => {
    if (!imageBlob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': imageBlob }),
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch {
      // Fallback: download
      handleDownload();
    }
  };

  const handleDownload = () => {
    if (!imageBlob) return;
    const url = URL.createObjectURL(imageBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taper-progress-${drug.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const linkText = shareUrl || `${window.location.origin}/journal`;

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`My taper update — ${drug}, Week ${weeksActive}`);
    const body = encodeURIComponent(
      `Hi,\n\nI wanted to share where I am in my ${drug} taper. I've been using TaperCommunity to document my progress.\n\nHere's my current chart:\n${linkText}\n\nBest`
    );
    const mailto = emailTo
      ? `mailto:${encodeURIComponent(emailTo)}?subject=${subject}&body=${body}`
      : `mailto:?subject=${subject}&body=${body}`;
    window.open(mailto, '_self');
  };

  const handleWhatsApp = async () => {
    // Ensure we have a link before sharing
    if (!shareUrl && !creating && !linkError) {
      await handleCreateLink();
    }
    const url = shareUrl || linkText;
    const text = encodeURIComponent(
      `Hey — I've been tapering off ${drug} and I wanted to show you where I'm at. This is what it looks like: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const isClinical = mode === 'clinical';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-5 sm:p-6"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute right-4 top-4 text-text-subtle hover:text-foreground">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {isClinical ? 'Send this to your prescriber' : 'Show someone who cares about you'}
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            {isClinical
              ? "Show them exactly where you are — before your next appointment."
              : "Help them understand what you're going through."}
          </p>
        </div>

        {/* Chart preview */}
        <div className="mb-4 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
          {capturing ? (
            <div className="flex h-40 items-center justify-center" style={{ background: 'var(--purple-ghost)' }}>
              <div className="text-center">
                <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2" style={{ borderColor: 'var(--purple-pale)', borderTopColor: 'var(--purple)' }} />
                <p className="text-xs text-text-muted">Capturing chart...</p>
              </div>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt="Taper progress chart" className="w-full" />
          ) : (
            <div className="flex h-40 items-center justify-center" style={{ background: 'var(--purple-ghost)' }}>
              <p className="text-xs text-text-muted">Chart preview unavailable</p>
            </div>
          )}
        </div>

        <p className="mb-4 text-center text-xs font-medium" style={{ color: 'var(--purple)' }}>{caption}</p>

        {/* Actions */}
        {isClinical ? (
          <div className="space-y-3">
            {/* Email input */}
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">Prescriber&apos;s email (optional)</label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="doctor@example.com"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--border-subtle)' }}
              />
            </div>
            <button
              onClick={handleEmailShare}
              className="btn btn-primary w-full text-sm"
            >
              <svg className="mr-2 inline h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Email to prescriber
            </button>
            <button onClick={handleCopyLink} disabled={!shareUrl && !linkError} className="btn btn-secondary w-full text-sm disabled:opacity-50">
              {copied ? 'Copied!' : linkError ? 'Link unavailable' : shareUrl ? 'Copy shareable link' : 'Creating link...'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleWhatsApp}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: '#25D366' }}
            >
              <svg className="mr-2 inline h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Share on WhatsApp
            </button>
            <div className="flex gap-3">
              <button onClick={handleDownload} disabled={!imageBlob} className="btn btn-secondary flex-1 text-sm disabled:opacity-50">
                Download image
              </button>
              <button onClick={handleCopyImage} disabled={!imageBlob} className="btn btn-secondary flex-1 text-sm disabled:opacity-50">
                {copiedImage ? 'Copied!' : 'Copy image'}
              </button>
            </div>
            <button onClick={handleCopyLink} disabled={!shareUrl && !linkError} className="btn btn-secondary w-full text-sm disabled:opacity-50">
              {copied ? 'Copied!' : linkError ? 'Link unavailable' : shareUrl ? 'Copy shareable link' : 'Creating link...'}
            </button>
          </div>
        )}

        {/* Link status */}
        {creating && (
          <p className="mt-3 text-center text-xs text-text-subtle">Creating shareable link...</p>
        )}
      </div>
    </div>
  );
}
