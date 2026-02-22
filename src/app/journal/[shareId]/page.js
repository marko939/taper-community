'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useJournalStore } from '@/stores/journalStore';
import JournalChart from '@/components/journal/JournalChart';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import { PageLoading } from '@/components/shared/LoadingSpinner';

export default function SharedJournalPage() {
  const { shareId } = useParams();
  const sharedData = useJournalStore((s) => s.sharedEntries[shareId]);
  const fetchSharedEntries = useJournalStore((s) => s.fetchSharedEntries);

  useEffect(() => {
    fetchSharedEntries(shareId);
  }, [shareId, fetchSharedEntries]);

  const entries = sharedData?.entries || [];
  const loading = sharedData?.loading ?? true;

  if (loading) return <PageLoading />;

  if (entries.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-serif text-2xl text-white">Journal not found</h1>
        <p className="mt-2 text-brand-muted">
          This share link may be invalid or the journal has no entries.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-white">Shared Taper Journal</h1>
        <p className="mt-1 text-brand-muted">
          Read-only view of a community member&apos;s taper journal.
        </p>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold text-white">Taper Progress</h2>
        <JournalChart entries={entries} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Entries</h2>
        <div className="space-y-4">
          {entries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
