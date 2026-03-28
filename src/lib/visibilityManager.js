'use client';

import { useMessageStore } from '@/stores/messageStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useForumStore } from '@/stores/forumStore';
import { useThreadStore } from '@/stores/threadStore';
import { useFollowStore } from '@/stores/followStore';
import { useJournalStore } from '@/stores/journalStore';
import { useProfileStore } from '@/stores/profileStore';
import { useBlogStore } from '@/stores/blogStore';
import { useAuthStore } from '@/stores/authStore';

let _initialized = false;
let _handler = null;
let _debounceTimer = null;

function onVisibilityChange() {
  if (document.hidden) {
    // Tab going to background — pause everything
    if (_debounceTimer) {
      clearTimeout(_debounceTimer);
      _debounceTimer = null;
    }

    // Unsubscribe non-critical realtime channels
    useMessageStore.getState().unsubscribeRealtime();
    useNotificationStore.getState().unsubscribeRealtime();

    // Cancel all pending fetches across all stores
    useForumStore.getState().cancelAll();
    useThreadStore.getState().cancelAll();
    useFollowStore.getState().cancelAll?.();
    useJournalStore.getState().cancelAll?.();
    useProfileStore.getState().cancelAll?.();
    useBlogStore.getState().cancelAll?.();
    useNotificationStore.getState().cancelAll?.();
    useMessageStore.getState().cancelAll?.();
  } else {
    // Tab becoming visible — debounce to prevent rapid-fire
    if (_debounceTimer) clearTimeout(_debounceTimer);

    _debounceTimer = setTimeout(() => {
      _debounceTimer = null;

      const user = useAuthStore.getState().user;
      if (user?.id) {
        // Re-subscribe realtime channels
        useMessageStore.getState().subscribeRealtime();
        useNotificationStore.getState().subscribeRealtime();
      }

      // Invalidate stale caches so next render re-fetches fresh data
      useForumStore.getState().invalidate();
      useJournalStore.getState().invalidate();
      useFollowStore.getState().invalidateFeeds();
    }, 300);
  }
}

export function initVisibilityManager() {
  if (typeof window === 'undefined') return;
  if (process.env.NEXT_PUBLIC_VISIBILITY_MANAGER === 'false') return;
  if (_initialized) return;

  _handler = onVisibilityChange;
  document.addEventListener('visibilitychange', _handler);
  _initialized = true;
}

export function destroyVisibilityManager() {
  if (_handler) {
    document.removeEventListener('visibilitychange', _handler);
    _handler = null;
  }
  if (_debounceTimer) {
    clearTimeout(_debounceTimer);
    _debounceTimer = null;
  }
  _initialized = false;
}
