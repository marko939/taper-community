'use client';

import { createClient } from '@/lib/supabase/client';
import { useForumStore } from '@/stores/forumStore';
import { useThreadStore } from '@/stores/threadStore';
import { useProfileStore } from '@/stores/profileStore';
import { useBlogStore } from '@/stores/blogStore';
import { useMessageStore } from '@/stores/messageStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useFollowStore } from '@/stores/followStore';
import { useJournalStore } from '@/stores/journalStore';

let _interval = null;
let _originalSetTimeout = null;
let _activeTimers = new Set();

function patchTimers() {
  if (_originalSetTimeout) return;
  _originalSetTimeout = window.setTimeout;
  window.setTimeout = function (...args) {
    const id = _originalSetTimeout.apply(window, args);
    _activeTimers.add(id);
    const originalClear = window.clearTimeout;
    const origCb = args[0];
    args[0] = function () {
      _activeTimers.delete(id);
      return typeof origCb === 'function' ? origCb() : undefined;
    };
    return id;
  };
  const originalClear = window.clearTimeout;
  window.clearTimeout = function (id) {
    _activeTimers.delete(id);
    return originalClear.call(window, id);
  };
}

function unpatchTimers() {
  if (_originalSetTimeout) {
    window.setTimeout = _originalSetTimeout;
    _originalSetTimeout = null;
  }
}

function getBrowserInfo() {
  const ua = navigator.userAgent;
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  return 'Unknown';
}

function getSnapshot() {
  const supabase = createClient();
  const allChannels = supabase.getChannels?.() ?? [];
  const channelDetails = allChannels.map((ch) => `${ch.topic}(${ch.state})`);
  const channels = allChannels.length;
  const heap = performance.memory?.usedJSHeapSize
    ? (performance.memory.usedJSHeapSize / 1048576).toFixed(1) + 'MB'
    : 'N/A';

  const forumState = useForumStore.getState();
  const threadState = useThreadStore.getState();
  const profileState = useProfileStore.getState();
  const blogState = useBlogStore.getState();

  const messageState = useMessageStore.getState();
  const notificationState = useNotificationStore.getState();
  const followState = useFollowStore.getState();
  const journalState = useJournalStore.getState();

  const totalPendingAborts =
    Object.keys(forumState._abortControllers).length +
    Object.keys(threadState._abortControllers).length +
    Object.keys(profileState._abortControllers).length +
    Object.keys(blogState._abortControllers).length +
    Object.keys(messageState._abortControllers).length +
    Object.keys(notificationState._abortControllers).length +
    Object.keys(followState._abortControllers).length +
    Object.keys(journalState._abortControllers).length;

  return {
    browser: getBrowserInfo(),
    channels,
    channelDetails: channelDetails.join(', ') || 'none',
    heap,
    threadsCached: Object.keys(threadState.threads).length,
    forumPages: Object.keys(forumState.threadPages).length,
    profilesCached: Object.keys(profileState.profiles).length,
    blogComments: Object.keys(blogState.comments).length,
    pendingAborts: totalPendingAborts,
    activeTimers: _activeTimers.size,
    route: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
  };
}

export function initPerfAudit() {
  if (_interval) return;
  patchTimers();

  _interval = setInterval(() => {
    const snap = getSnapshot();
    console.table(snap);
  }, 5000);

  window.__taperDiag = window.__taperDiag || {};
  window.__taperDiag.dump = () => {
    const snap = getSnapshot();
    console.table(snap);
    return snap;
  };

  window.__taperDiag.routeHealth = () => {
    return {
      forum: useForumStore.getState().getSnapshot(),
      thread: useThreadStore.getState().getSnapshot(),
      profile: useProfileStore.getState().getSnapshot(),
      blog: useBlogStore.getState().getSnapshot?.() || {},
    };
  };

  console.log('[TaperDiag] Performance audit started (5s interval). Call window.__taperDiag.dump() for manual snapshot.');
}

export function destroyPerfAudit() {
  if (_interval) {
    clearInterval(_interval);
    _interval = null;
  }
  unpatchTimers();
  _activeTimers.clear();
}
