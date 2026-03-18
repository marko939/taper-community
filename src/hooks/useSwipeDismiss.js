'use client';

import { useRef, useCallback } from 'react';

const DISMISS_THRESHOLD = 120; // px
const VELOCITY_THRESHOLD = 0.5; // px/ms

/**
 * Swipe-down-to-dismiss hook for modals/sheets.
 * Returns touch handlers and current transform for the container.
 */
export function useSwipeDismiss(onDismiss) {
  const startY = useRef(0);
  const startTime = useRef(0);
  const currentY = useRef(0);
  const sheetRef = useRef(null);

  const onTouchStart = useCallback((e) => {
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
    currentY.current = 0;
  }, []);

  const onTouchMove = useCallback((e) => {
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      currentY.current = dy;
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${dy}px)`;
      }
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    const dy = currentY.current;
    const dt = Date.now() - startTime.current;
    const velocity = dy / dt;

    if (dy > DISMISS_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      onDismiss();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)';
      sheetRef.current.style.transition = 'transform 0.2s ease-out';
      setTimeout(() => {
        if (sheetRef.current) sheetRef.current.style.transition = '';
      }, 200);
    }
    currentY.current = 0;
  }, [onDismiss]);

  return {
    sheetRef,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
