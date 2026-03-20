'use client';

import { useRef, memo, useEffect } from 'react';
import ThreadCard from './ThreadCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const MemoThreadCard = memo(ThreadCard);

export default function ThreadList({ threads = [], loading = false, hasMore = false, totalCount, onLoadMore }) {
  const loadingMore = useRef(false);

  // Keep onLoadMore in a ref so the effect doesn't re-fire on every parent render
  const onLoadMoreRef = useRef(onLoadMore);
  useEffect(() => { onLoadMoreRef.current = onLoadMore; }, [onLoadMore]);

  if (loading && threads.length === 0) return <LoadingSpinner className="py-16" />;

  if (threads.length === 0) {
    return (
      <div className="card py-12 text-center">
        <p className="text-text-muted">No threads yet. Be the first to start a discussion!</p>
      </div>
    );
  }

  return (
    <div>
      {threads.map((thread) => (
        <div key={thread.id} style={{ marginBottom: 12 }}>
          <MemoThreadCard thread={thread} />
        </div>
      ))}
      {loading && <LoadingSpinner className="py-4" />}
      {hasMore && onLoadMore && (
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="rounded-xl px-6 py-2.5 text-sm font-medium transition active:scale-95 disabled:opacity-50"
            style={{ color: 'var(--purple)', border: '1px solid var(--border-subtle)' }}
          >
            {loading ? 'Loading...' : (
              <>
                Show more
                {totalCount != null && (
                  <span className="ml-2 text-xs text-text-subtle">
                    ({threads.length} of {totalCount})
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
