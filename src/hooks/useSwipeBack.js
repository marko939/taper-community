'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const EDGE_ZONE = 30; // px from left edge to start swipe
const BACK_THRESHOLD = 100; // px needed to trigger back

/**
 * Swipe-right-from-left-edge to navigate back.
 * Only active on mobile (< 1024px).
 * Returns { containerRef, swipeDistance, isSwiping }
 */
export function useSwipeBack() {
  const router = useRouter();
  const containerRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const edgeSwipe = useRef(false);

  const handleTouchStart = useCallback((e) => {
    // Only on mobile
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return;

    const x = e.touches[0].clientX;
    if (x <= EDGE_ZONE) {
      startX.current = x;
      startY.current = e.touches[0].clientY;
      edgeSwipe.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!edgeSwipe.current) return;

    const dx = e.touches[0].clientX - startX.current;
    const dy = Math.abs(e.touches[0].clientY - startY.current);

    // If vertical scroll is dominant, cancel the swipe
    if (dy > dx) {
      edgeSwipe.current = false;
      setIsSwiping(false);
      setSwipeDistance(0);
      return;
    }

    if (dx > 10) {
      setIsSwiping(true);
      setSwipeDistance(Math.min(dx, 200));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!edgeSwipe.current) return;

    if (swipeDistance >= BACK_THRESHOLD) {
      router.back();
    }

    setIsSwiping(false);
    setSwipeDistance(0);
    edgeSwipe.current = false;
  }, [swipeDistance, router]);

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

  return { containerRef, swipeDistance, isSwiping };
}
