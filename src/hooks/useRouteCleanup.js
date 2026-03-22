'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useThreadStore } from '@/stores/threadStore';
import { useForumStore } from '@/stores/forumStore';
import { useJournalStore } from '@/stores/journalStore';
import { useFollowStore } from '@/stores/followStore';

/**
 * Cancels all pending store fetches on unmount and on route change.
 * Also invalidates cached feed data so pages re-fetch on revisit.
 * Accepts an optional extra cleanup function for component-specific teardown.
 */
export function useRouteCleanup(extraCleanup) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // On route change (soft navigation), cancel pending fetches and invalidate feeds
    if (prevPathname.current !== pathname) {
      useThreadStore.getState().cancelAll();
      useForumStore.getState().cancelAll();
      useForumStore.getState().invalidate();
      useJournalStore.getState().invalidate();
      useFollowStore.getState().invalidateFeeds();
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
