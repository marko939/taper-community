'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

const THRESHOLD = 60; // px needed to trigger refresh

/**
 * Pull-to-refresh hook using native touch events.
 * Returns { containerRef, isPulling, pullDistance, isRefreshing }
 * Attach containerRef to the scrollable container element.
 */
export function usePullToRefresh(onRefresh) {
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pulling = useRef(false);

  const handleTouchStart = useCallback((e) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return; // Only activate at top
    touchStartY.current = e.touches[0].clientY;
    pulling.current = false;
  }, []);

  const handleTouchMove = useCallback((e) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) return;

    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 10) {
      pulling.current = true;
      setIsPulling(true);
      // Dampen the pull distance (rubber band effect)
      setPullDistance(Math.min(dy * 0.5, 120));
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;

    if (pullDistance >= THRESHOLD && onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
    pulling.current = false;
  }, [pullDistance, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

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
