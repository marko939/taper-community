'use client';

import ThreadCard from './ThreadCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ThreadList({ threads = [], loading = false, hasMore = false, totalCount, onLoadMore }) {
  if (loading && threads.length === 0) return <LoadingSpinner className="py-16" />;

  if (threads.length === 0) {
    return (
      <div className="card py-12 text-center">
        <p className="text-text-muted">No threads yet. Be the first to start a discussion!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {threads.map((thread) => (
        <ThreadCard key={thread.id} thread={thread} />
      ))}

      {hasMore && onLoadMore && (
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={onLoadMore}
            className="rounded-xl px-6 py-2.5 text-sm font-medium transition hover:bg-purple-ghost"
            style={{ color: 'var(--purple)', border: '1px solid var(--border-subtle)' }}
          >
            Load more threads
            {totalCount != null && (
              <span className="ml-2 text-xs text-text-subtle">
                ({threads.length} of {totalCount})
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
