'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Thin progress bar at the top of the viewport during route transitions.
 * Uses pathname changes to detect navigation start/end.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    // Navigation completed — finish the bar
    if (timerRef.current) clearTimeout(timerRef.current);
    setProgress(100);
    setVisible(true);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      // Reset after fade-out
      setTimeout(() => setProgress(0), 300);
    }, 200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  if (progress === 0 && !visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 300ms ease',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--purple)',
          transition: 'width 300ms ease',
          borderRadius: '0 2px 2px 0',
        }}
      />
    </div>
  );
}
