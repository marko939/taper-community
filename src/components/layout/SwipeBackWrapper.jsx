'use client';

import { useSwipeBack } from '@/hooks/useSwipeBack';

/**
 * Wraps main content area with swipe-right-to-go-back gesture.
 * Only active on mobile (< 1024px viewport).
 */
export default function SwipeBackWrapper({ children }) {
  const { containerRef, swipeDistance, isSwiping } = useSwipeBack();

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      {/* Swipe back visual indicator */}
      {isSwiping && (
        <div
          className="pointer-events-none fixed left-0 top-1/2 z-[70] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full"
          style={{
            background: 'var(--purple)',
            opacity: Math.min(swipeDistance / 100, 0.8),
            transform: `translateX(${Math.min(swipeDistance - 20, 30)}px) translateY(-50%)`,
          }}
        >
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </div>
      )}
      {children}
    </div>
  );
}
