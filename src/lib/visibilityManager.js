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
import { runHeartbeat } from '@/lib/realtimeGuard';
import { checkSessionHealth } from '@/lib/sessionHealthCheck';

let _initialized = false;
let _handler = null;
let _debounceTimer = null;
let _processing = false; // Re-entrant guard for Safari rapid-fire events
let _processingTimeout = null; // Safety: auto-reset _processing if async ops hang

// Resolves when auth is confirmed fresh after a stale tab.
// Components/stores can await this before fetching.
let _authRefreshed = Promise.resolve();

function safeCall(label, fn) {
  try { fn(); } catch (e) {
    console.warn(`[visibilityManager] ${label} failed:`, e);
  }
}

function onVisibilityChange() {
  if (document.hidden) {
    if (_debounceTimer) {
      clearTimeout(_debounceTimer);
      _debounceTimer = null;
    }

    // Each store call wrapped individually so one failure doesn't block others
    safeCall('msg unsub', () => useMessageStore.getState().unsubscribeRealtime());
    safeCall('notif unsub', () => useNotificationStore.getState().unsubscribeRealtime());

    safeCall('forum cancel', () => useForumStore.getState().cancelAll());
    safeCall('thread cancel', () => useThreadStore.getState().cancelAll());
    safeCall('follow cancel', () => useFollowStore.getState().cancelAll?.());
    safeCall('journal cancel', () => useJournalStore.getState().cancelAll?.());
    safeCall('profile cancel', () => useProfileStore.getState().cancelAll?.());
    safeCall('blog cancel', () => useBlogStore.getState().cancelAll?.());
    safeCall('notif cancel', () => useNotificationStore.getState().cancelAll?.());
    safeCall('msg cancel', () => useMessageStore.getState().cancelAll?.());

    // Mark auth as needing refresh for next visible event
    let _resolve;
    _authRefreshed = new Promise(r => { _resolve = r; });
    _authRefreshed._resolve = _resolve;
    // Safety: auto-resolve after 8s so nothing hangs forever
    _authRefreshed._safetyTimer = setTimeout(() => {
      if (_authRefreshed._resolve) {
        console.warn('[visibilityManager] _authRefreshed auto-resolved after 8s timeout');
        _authRefreshed._resolve();
        _authRefreshed = Promise.resolve();
      }
    }, 8000);
  } else {
    // Re-entrant guard: prevent concurrent show handlers (Safari fires rapid events)
    if (_processing) return;

    if (_debounceTimer) clearTimeout(_debounceTimer);

    _debounceTimer = setTimeout(async () => {
      _debounceTimer = null;
      if (_processing) return;
      _processing = true;

      // Safety: auto-reset _processing if async operations hang
      if (_processingTimeout) clearTimeout(_processingTimeout);
      _processingTimeout = setTimeout(() => {
        if (_processing) {
          console.warn('[visibilityManager] _processing guard auto-reset after 10s timeout');
          _processing = false;
        }
        _processingTimeout = null;
      }, 10000);

      try {
        // Step 1: Run realtime heartbeat — clean up dead WebSocket channels
        runHeartbeat();

        // Step 2: Refresh auth token (ONE call, no lock contention)
        let session = null;
        try {
          const supabase = createClient();
          const { data } = await supabase.auth.getSession();
          session = data?.session;
        } catch (e) {
          console.warn('[visibilityManager] auth refresh failed:', e);
        }

        // Step 3: Resolve auth promise ASAP so downstream isn't blocked
        if (_authRefreshed._safetyTimer) clearTimeout(_authRefreshed._safetyTimer);
        if (_authRefreshed._resolve) {
          _authRefreshed._resolve();
          _authRefreshed = Promise.resolve();
        }

        // Step 4: Check session health (Safari ITP guard)
        const wasAuthenticated = !!useAuthStore.getState().user;
        safeCall('session health', () => checkSessionHealth(session, wasAuthenticated));

        // Step 5: Re-subscribe realtime
        const user = useAuthStore.getState().user;
        if (user?.id) {
          safeCall('msg sub', () => useMessageStore.getState().subscribeRealtime());
          safeCall('notif sub', () => useNotificationStore.getState().subscribeRealtime());
        }

        // Step 6: Invalidate + force re-fetch with now-fresh auth
        safeCall('forum refetch', () => {
          useForumStore.getState().invalidate();
          useForumStore.getState().fetchHotThreads(10, { force: true });
          useForumStore.getState().fetchNewThreads(10, { force: true });
        });
        safeCall('blog refetch', () => {
          useBlogStore.getState().invalidate();
          useBlogStore.getState().fetchPosts();
        });
        safeCall('journal refetch', () => useJournalStore.getState().invalidate());
        safeCall('follow refetch', () => useFollowStore.getState().invalidateFeeds());
        safeCall('thread refetch', () => useThreadStore.getState().refreshVisible());
        if (user?.id) {
          safeCall('follow fetch', () => useFollowStore.getState().fetchFollowedThreads({ force: true }));
        }
      } finally {
        _processing = false;
        if (_processingTimeout) {
          clearTimeout(_processingTimeout);
          _processingTimeout = null;
        }
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
    if (_authRefreshed._safetyTimer) clearTimeout(_authRefreshed._safetyTimer);
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
  if (_authRefreshed._safetyTimer) clearTimeout(_authRefreshed._safetyTimer);
  if (_authRefreshed._resolve) {
    _authRefreshed._resolve();
  }
  _authRefreshed = Promise.resolve();
  if (_processingTimeout) {
    clearTimeout(_processingTimeout);
    _processingTimeout = null;
  }
  _processing = false;
  _initialized = false;
}
