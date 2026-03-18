'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const EDGE_ZONE = 30; // px from left edge to start swipe
const BACK_THRESHOLD = 100; // px needed to trigger back

/**
 * Swipe-right-from-left-edge to navigate back.
 * Only active on mobile (< 1024px).
 * Returns { containerRef, swipeDistance, isSwiping }
 *
 * All touch state is stored in refs so the event listeners never need
 * to be re-attached — prevents the listener-stacking bug that caused
 * main-thread blocking after a few navigations.
 */
export function useSwipeBack() {
  const router = useRouter();
  const containerRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const edgeSwipe = useRef(false);
  const distanceRef = useRef(0);

  // State only for triggering re-renders — logic uses refs
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Keep router in a ref so the listener closure always has the latest
  const routerRef = useRef(router);
  useEffect(() => { routerRef.current = router; }, [router]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onTouchStart(e) {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) return;
      const x = e.touches[0].clientX;
      if (x <= EDGE_ZONE) {
        startX.current = x;
        startY.current = e.touches[0].clientY;
        edgeSwipe.current = true;
      }
    }

    function onTouchMove(e) {
      if (!edgeSwipe.current) return;
      const dx = e.touches[0].clientX - startX.current;
      const dy = Math.abs(e.touches[0].clientY - startY.current);

      if (dy > dx) {
        edgeSwipe.current = false;
        distanceRef.current = 0;
        setIsSwiping(false);
        setSwipeDistance(0);
        return;
      }

      if (dx > 10) {
        const d = Math.min(dx, 200);
        distanceRef.current = d;
        setIsSwiping(true);
        setSwipeDistance(d);
      }
    }

    function onTouchEnd() {
      if (!edgeSwipe.current) return;
      if (distanceRef.current >= BACK_THRESHOLD) {
        routerRef.current.back();
      }
      distanceRef.current = 0;
      edgeSwipe.current = false;
      setIsSwiping(false);
      setSwipeDistance(0);
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
  }, []); // Mount once — all mutable data accessed via refs

  return { containerRef, swipeDistance, isSwiping };
}
