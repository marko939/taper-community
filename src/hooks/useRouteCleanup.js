'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useThreadStore } from '@/stores/threadStore';
import { useForumStore } from '@/stores/forumStore';

/**
 * Cancels all pending store fetches on unmount and on route change.
 * Accepts an optional extra cleanup function for component-specific teardown.
 */
export function useRouteCleanup(extraCleanup) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // On route change (soft navigation), cancel pending fetches
    if (prevPathname.current !== pathname) {
      useThreadStore.getState().cancelAll();
      useForumStore.getState().cancelAll();
      extraCleanup?.();
      prevPathname.current = pathname;
    }

    // On unmount, cancel pending fetches
    return () => {
      useThreadStore.getState().cancelAll();
      useForumStore.getState().cancelAll();
      extraCleanup?.();
    };
  }, [pathname, extraCleanup]);
}
