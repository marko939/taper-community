'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useThreadStore } from '@/stores/threadStore';
import { useForumStore } from '@/stores/forumStore';
import { useJournalStore } from '@/stores/journalStore';
import { useFollowStore } from '@/stores/followStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useMessageStore } from '@/stores/messageStore';
import { useProfileStore } from '@/stores/profileStore';
import { useBlogStore } from '@/stores/blogStore';
import { cancelVisibilityDebounce, waitForAuth } from '@/lib/visibilityManager';

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
      // Kill any pending visibility debounce so it doesn't fire invalidate()
      // AFTER the new page's mount effects already started fetching.
      cancelVisibilityDebounce();
      cancelAllStores();
      useForumStore.getState().invalidate();
      useJournalStore.getState().invalidate();
      useFollowStore.getState().invalidateFeeds();
      extraCleanup?.();
      prevPathname.current = pathname;
    }

    // On unmount, cancel pending fetches
    return () => {
      cancelAllStores();
      extraCleanup?.();
    };
  }, [pathname, extraCleanup]);
}

function cancelAllStores() {
  useThreadStore.getState().cancelAll();
  useForumStore.getState().cancelAll();
  useFollowStore.getState().cancelAll();
  useJournalStore.getState().cancelAll();
  useNotificationStore.getState().cancelAll();
  useMessageStore.getState().cancelAll();
  useProfileStore.getState().cancelAll();
  useBlogStore.getState().cancelAll();
}
