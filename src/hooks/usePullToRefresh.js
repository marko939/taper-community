'use client';

import { useRef, useState, useEffect } from 'react';

const THRESHOLD = 60; // px needed to trigger refresh

/**
 * Pull-to-refresh hook using native touch events.
 * Returns { containerRef, isPulling, pullDistance, isRefreshing }
 * Attach containerRef to the scrollable container element.
 *
 * All touch state lives in refs — listeners attach once on mount
 * and never re-attach, preventing the listener-stacking memory leak.
 */
export function usePullToRefresh(onRefresh) {
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const distanceRef = useRef(0);
  const pulling = useRef(false);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Keep onRefresh callback current without re-attaching listeners
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onTouchStart(e) {
      if (refreshingRef.current) return;
      if (el.scrollTop > 0) return;
      touchStartY.current = e.touches[0].clientY;
      pulling.current = false;
    }

    function onTouchMove(e) {
      if (refreshingRef.current) return;
      if (el.scrollTop > 0) return;

      const dy = e.touches[0].clientY - touchStartY.current;
      if (dy > 10) {
        pulling.current = true;
        const d = Math.min(dy * 0.5, 120);
        distanceRef.current = d;
        setIsPulling(true);
        setPullDistance(d);
      }
    }

    async function onTouchEnd() {
      if (!pulling.current) return;

      if (distanceRef.current >= THRESHOLD && onRefreshRef.current) {
        refreshingRef.current = true;
        setIsRefreshing(true);
        try {
          await onRefreshRef.current();
        } finally {
          refreshingRef.current = false;
          setIsRefreshing(false);
        }
      }

      distanceRef.current = 0;
      pulling.current = false;
      setIsPulling(false);
      setPullDistance(0);
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart, { passive: true });
      el.removeEventListener('touchmove', onTouchMove, { passive: true });
      el.removeEventListener('touchend', onTouchEnd, { passive: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount once

  return { containerRef, isPulling, pullDistance, isRefreshing };
}

/**
 * Pull-to-refresh indicator component.
 * Place this above the scrollable content.
 */
export function PullIndicator({ isPulling, pullDistance, isRefreshing }) {
  if (!isPulling && !isRefreshing) return null;

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const rotation = isRefreshing ? 'animate-spin' : '';

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-all"
      style={{ height: isRefreshing ? 48 : pullDistance, opacity: progress }}
    >
      <svg
        className={`h-6 w-6 ${rotation}`}
        style={{ color: 'var(--purple)', transform: `rotate(${progress * 360}deg)` }}
        fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
    </div>
  );
}
