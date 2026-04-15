'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Tracks whether a client-side navigation is in progress.
 *
 * Usage:
 *   const { isNavigating, startNavigation } = useNavigationState();
 *   // On a Link click or before router.push:
 *   <Link href="/foo" onClick={startNavigation}>Go</Link>
 *
 * Navigation completion is detected via `usePathname()` changing — the only
 * reliable signal in the Next.js App Router. A 5-second hard timeout makes
 * it impossible for the spinner to spin forever under any circumstances.
 *
 * NOTE: This hook is not currently consumed by any component. It is
 * available for wiring into a progress bar / spinner whenever one is added.
 */
export function useNavigationState() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      // Pathname changed = navigation completed
      setIsNavigating(false);
      prevPathRef.current = pathname;
    }
  }, [pathname, searchParams]);

  function startNavigation() {
    setIsNavigating(true);
    // Hard timeout — spinner CANNOT show for more than 5 seconds.
    setTimeout(() => setIsNavigating(false), 5000);
  }

  return { isNavigating, startNavigation };
}
