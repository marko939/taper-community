'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useJournalStore } from '@/stores/journalStore';
import JournalEntryForm from '@/components/journal/JournalEntryForm';
import JournalChart from '@/components/journal/JournalChart';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import { PageLoading } from '@/components/shared/LoadingSpinner';

export default function JournalPage() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const entries = useJournalStore((s) => s.entries);
  const loading = useJournalStore((s) => s.loading);
  const fetchEntries = useJournalStore((s) => s.fetchEntries);
  const addEntry = useJournalStore((s) => s.addEntry);
  const getShareLink = useJournalStore((s) => s.getShareLink);
  const [shareUrl, setShareUrl] = useState(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user, fetchEntries]);

  if (authLoading) return <PageLoading />;

  if (!user) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="font-serif text-3xl font-semibold text-foreground">Taper Journal</h1>
        <p className="mt-3 text-text-muted">
          Track your doses, symptoms, and mood over time. Sign in to start journaling.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/auth/signin" className="btn btn-secondary text-sm no-underline">
            Sign In
          </Link>
          <Link href="/auth/signup" className="btn btn-primary text-sm no-underline">
            Join Community
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <PageLoading />;

  const handleSubmit = async (entry) => {
    await addEntry(entry);
  };

  const handleShare = async () => {
    setSharing(true);
    const token = await getShareLink();
    if (token) {
      setShareUrl(`${window.location.origin}/journal/${token}`);
    }
    setSharing(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Taper Journal</h1>
          <p className="mt-1 text-text-muted">
            Track your doses, symptoms, and mood over time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {shareUrl ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="input w-64 text-xs"
                onClick={(e) => e.target.select()}
              />
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="btn-secondary text-sm"
              >
                Copy
              </button>
            </div>
          ) : (
            <button
              onClick={handleShare}
              disabled={sharing}
              className="btn-secondary text-sm"
            >
              {sharing ? 'Generating...' : 'Share Journal'}
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Your Taper Progress</h2>
        <JournalChart entries={entries} />
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Log an Entry</h2>
        <JournalEntryForm onSubmit={handleSubmit} entryCount={entries.length} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Entry History</h2>
        {entries.length === 0 ? (
          <p className="text-text-muted">
            No entries yet. Start logging to track your progress.
          </p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <JournalEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
