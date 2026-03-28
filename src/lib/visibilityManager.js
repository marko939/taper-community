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

/**
 * Global auth readiness promise.
 * When the tab becomes visible after being hidden, the JWT may be expired.
 * This promise resolves once auth has been refreshed. Any component that
 * fetches data can await this to ensure the token is fresh.
 */
let _authReady = Promise.resolve();
let _authReadyResolve = null;

/**
 * Await this before making Supabase requests after a stale tab.
 * Resolves immediately if auth is already fresh.
 */
export function waitForAuth() {
  return _authReady;
}

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

    // Set up auth gate — any fetch that starts before auth refresh
    // completes will await this promise
    _authReady = new Promise((resolve) => {
      _authReadyResolve = resolve;
    });
  } else {
    // Tab becoming visible — refresh auth IMMEDIATELY (not debounced).
    // This ensures any navigation that happens before the debounce timer
    // fires will still have a fresh auth token.
    (async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        await supabase.auth.getSession(); // triggers token refresh if expired
      } catch (e) {
        console.warn('[visibilityManager] auth refresh failed:', e);
      } finally {
        // Resolve the auth gate so pending fetches can proceed
        if (_authReadyResolve) {
          _authReadyResolve();
          _authReadyResolve = null;
        }
        _authReady = Promise.resolve();
      }
    })();

    // Debounce the data re-fetch (but NOT the auth refresh above)
    if (_debounceTimer) clearTimeout(_debounceTimer);

    _debounceTimer = setTimeout(async () => {
      _debounceTimer = null;

      // Wait for auth refresh to complete before fetching
      await _authReady;

      const user = useAuthStore.getState().user;
      if (user?.id) {
        useMessageStore.getState().subscribeRealtime();
        useNotificationStore.getState().subscribeRealtime();
      }

      // Invalidate stale caches AND force re-fetch feed data
      useForumStore.getState().invalidate();
      useForumStore.getState().fetchHotThreads(10, { force: true });
      useForumStore.getState().fetchNewThreads(10, { force: true });
      useBlogStore.getState().invalidate();
      useBlogStore.getState().fetchPosts();
      useJournalStore.getState().invalidate();
      useFollowStore.getState().invalidateFeeds();
      if (user?.id) {
        useFollowStore.getState().fetchFollowedThreads({ force: true });
      }
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

/**
 * Cancel any pending visibility debounce timer.
 * NOTE: This only cancels the data re-fetch debounce, NOT the auth refresh.
 * Auth refresh runs immediately and independently.
 */
export function cancelVisibilityDebounce() {
  if (_debounceTimer) {
    clearTimeout(_debounceTimer);
    _debounceTimer = null;
  }
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
  if (_authReadyResolve) {
    _authReadyResolve();
    _authReadyResolve = null;
  }
  _authReady = Promise.resolve();
  _initialized = false;
}
