'use client';

import { createClient } from '@/lib/supabase/client';
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

// Resolves when auth is confirmed fresh after a stale tab.
// Components/stores can await this before fetching.
let _authRefreshed = Promise.resolve();

function onVisibilityChange() {
  if (document.hidden) {
    if (_debounceTimer) {
      clearTimeout(_debounceTimer);
      _debounceTimer = null;
    }

    useMessageStore.getState().unsubscribeRealtime();
    useNotificationStore.getState().unsubscribeRealtime();

    useForumStore.getState().cancelAll();
    useThreadStore.getState().cancelAll();
    useFollowStore.getState().cancelAll?.();
    useJournalStore.getState().cancelAll?.();
    useProfileStore.getState().cancelAll?.();
    useBlogStore.getState().cancelAll?.();
    useNotificationStore.getState().cancelAll?.();
    useMessageStore.getState().cancelAll?.();

    // Mark auth as needing refresh for next visible event
    let _resolve;
    _authRefreshed = new Promise(r => { _resolve = r; });
    _authRefreshed._resolve = _resolve;
  } else {
    // Tab visible — ONE auth refresh, then ALL fetches after it completes
    if (_debounceTimer) clearTimeout(_debounceTimer);

    _debounceTimer = setTimeout(async () => {
      _debounceTimer = null;

      // Step 1: Refresh auth token (ONE call, no lock contention)
      try {
        const supabase = createClient();
        await supabase.auth.getSession();
      } catch (e) {
        console.warn('[visibilityManager] auth refresh failed:', e);
      }

      // Resolve the auth promise so any waiting fetches can proceed
      if (_authRefreshed._resolve) {
        _authRefreshed._resolve();
        _authRefreshed = Promise.resolve();
      }

      // Step 2: Re-subscribe realtime
      const user = useAuthStore.getState().user;
      if (user?.id) {
        useMessageStore.getState().subscribeRealtime();
        useNotificationStore.getState().subscribeRealtime();
      }

      // Step 3: Invalidate + force re-fetch with now-fresh auth
      useForumStore.getState().invalidate();
      useForumStore.getState().fetchHotThreads(10, { force: true });
      useForumStore.getState().fetchNewThreads(10, { force: true });
      useBlogStore.getState().invalidate();
      useBlogStore.getState().fetchPosts();
      useJournalStore.getState().invalidate();
      useFollowStore.getState().invalidateFeeds();
      useThreadStore.getState().refreshVisible();
      if (user?.id) {
        useFollowStore.getState().fetchFollowedThreads({ force: true });
      }
    }, 300);
  }
}

/**
 * Returns a promise that resolves once auth is confirmed fresh.
 * If the tab was never stale, resolves immediately.
 * Call this before fetching after a navigation from a stale tab.
 */
export function authReady() {
  return _authRefreshed;
}

export function initVisibilityManager() {
  if (typeof window === 'undefined') return;
  if (process.env.NEXT_PUBLIC_VISIBILITY_MANAGER === 'false') return;
  if (_initialized) return;

  _handler = onVisibilityChange;
  document.addEventListener('visibilitychange', _handler);
  _initialized = true;
}

export function cancelVisibilityDebounce() {
  if (_debounceTimer) {
    clearTimeout(_debounceTimer);
    _debounceTimer = null;
  }
  // Even if debounce is cancelled (user navigated), resolve auth
  // so navigated-to pages aren't stuck waiting
  if (_authRefreshed._resolve) {
    // Kick off auth refresh independently
    (async () => {
      try {
        const supabase = createClient();
        await supabase.auth.getSession();
      } catch {}
      if (_authRefreshed._resolve) {
        _authRefreshed._resolve();
        _authRefreshed = Promise.resolve();
      }
    })();
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
  if (_authRefreshed._resolve) {
    _authRefreshed._resolve();
  }
  _authRefreshed = Promise.resolve();
  _initialized = false;
}
