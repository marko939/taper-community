'use client';

import { useRef, useCallback, memo, useEffect, useState } from 'react';
import { List } from 'react-window';
import ThreadCard from './ThreadCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const ITEM_HEIGHT = 140;
const OVERSCAN = 5;
const LOAD_THRESHOLD = 4; // items from end to trigger load

const MemoThreadCard = memo(ThreadCard);

export default function ThreadList({ threads = [], loading = false, hasMore = false, totalCount, onLoadMore }) {
  const listRef = useRef(null);
  const loadingMore = useRef(false);
  const [visibleStop, setVisibleStop] = useState(0);

  // Keep onLoadMore in a ref so the effect doesn't re-fire on every parent render
  const onLoadMoreRef = useRef(onLoadMore);
  useEffect(() => { onLoadMoreRef.current = onLoadMore; }, [onLoadMore]);

  // Fire load-more in an effect — safe, outside render cycle
  const itemCount = threads.length;
  useEffect(() => {
    if (
      hasMore &&
      onLoadMoreRef.current &&
      itemCount > 0 &&
      visibleStop >= itemCount - LOAD_THRESHOLD &&
      !loadingMore.current
    ) {
      loadingMore.current = true;
      Promise.resolve(onLoadMoreRef.current()).finally(() => {
        loadingMore.current = false;
      });
    }
  }, [visibleStop, itemCount, hasMore]);

  // Handle load-more via onItemsRendered callback (not during render)
  const handleItemsRendered = useCallback(({ visibleStopIndex }) => {
    setVisibleStop(visibleStopIndex);
  }, []);

  if (loading && threads.length === 0) return <LoadingSpinner className="py-16" />;

  if (threads.length === 0) {
    return (
      <div className="card py-12 text-center">
        <p className="text-text-muted">No threads yet. Be the first to start a discussion!</p>
      </div>
    );
  }

  // Calculate list height — fill viewport minus approximate header offset
  const listHeight = typeof window !== 'undefined'
    ? Math.min(window.innerHeight - 200, itemCount * ITEM_HEIGHT)
    : 600;

  // Skip react-window if very few items — avoids strict mode crash
  if (itemCount <= 20) {
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
              className="rounded-xl px-6 py-2.5 text-sm font-medium transition active:scale-95"
              style={{ color: 'var(--purple)', border: '1px solid var(--border-subtle)' }}
            >
              Show more
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <List
        ref={listRef}
        height={listHeight}
        itemCount={itemCount}
        itemSize={ITEM_HEIGHT}
        overscanCount={OVERSCAN}
        width="100%"
        onItemsRendered={handleItemsRendered}
      >
        {({ index, style }) => {
          const thread = threads[index];

          if (!thread) {
            return (
              <div style={style} className="flex items-center justify-center">
                <LoadingSpinner className="py-4" />
              </div>
            );
          }

          return (
            <div style={{ ...style, paddingBottom: 12 }}>
              <MemoThreadCard thread={thread} />
            </div>
          );
        }}
      </List>

      {hasMore && onLoadMore && (
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={onLoadMore}
            className="rounded-xl px-6 py-2.5 text-sm font-medium transition active:scale-95"
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
