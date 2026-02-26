'use client';

import { useState } from 'react';
import { createInviteLink } from '@/lib/invites';

const PROMPTS = {
  low_mood: {
    emoji: '💜',
    headline: 'Going through this alone is harder.',
    body: 'Know someone else tapering? Invite them so you can support each other.',
  },
  habit: {
    emoji: '🔥',
    headline: "You're building a habit.",
    body: 'Help a friend start theirs. Send them an invite to TaperCommunity.',
  },
};

export default function InvitePrompt({ trigger, userId }) {
  const [dismissed, setDismissed] = useState(false);
  const [inviteUrl, setInviteUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (dismissed || !trigger) return null;

  const prompt = PROMPTS[trigger];
  if (!prompt) return null;

  const handleInvite = async () => {
    setLoading(true);
    try {
      const code = await createInviteLink(userId);
      if (code) {
        const url = `${window.location.origin}/join?ref=${code}`;
        setInviteUrl(url);
      }
    } catch (err) {
      console.error('[InvitePrompt] invite error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (inviteUrl && navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on TaperCommunity',
          text: "I've been tracking my medication taper on TaperCommunity. Join me!",
          url: inviteUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="relative rounded-2xl border p-4"
      style={{ borderColor: 'var(--purple-pale)', background: 'var(--purple-ghost)' }}
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-text-subtle hover:text-foreground"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <p className="text-lg">{prompt.emoji}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{prompt.headline}</p>
      <p className="mt-0.5 text-xs text-text-muted">{prompt.body}</p>

      {inviteUrl ? (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={inviteUrl}
            readOnly
            className="input flex-1 text-xs"
            onClick={(e) => e.target.select()}
          />
          <button onClick={handleShare} className="btn btn-primary text-xs">
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      ) : (
        <button
          onClick={handleInvite}
          disabled={loading}
          className="mt-3 rounded-lg px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--purple)' }}
        >
          {loading ? 'Creating...' : 'Invite a friend'}
        </button>
      )}
    </div>
  );
}
