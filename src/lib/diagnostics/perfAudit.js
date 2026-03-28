'use client';

import { createClient } from '@/lib/supabase/client';
import { useForumStore } from '@/stores/forumStore';
import { useThreadStore } from '@/stores/threadStore';
import { useProfileStore } from '@/stores/profileStore';
import { useBlogStore } from '@/stores/blogStore';

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

function getSnapshot() {
  const supabase = createClient();
  const channels = supabase.getChannels?.()?.length ?? 'N/A';
  const heap = performance.memory?.usedJSHeapSize
    ? (performance.memory.usedJSHeapSize / 1048576).toFixed(1) + 'MB'
    : 'N/A';

  const forumState = useForumStore.getState();
  const threadState = useThreadStore.getState();
  const profileState = useProfileStore.getState();
  const blogState = useBlogStore.getState();

  return {
    channels,
    heap,
    threadsCached: Object.keys(threadState.threads).length,
    forumPages: Object.keys(forumState.threadPages).length,
    profilesCached: Object.keys(profileState.profiles).length,
    blogComments: Object.keys(blogState.comments).length,
    pendingAborts:
      Object.keys(forumState._abortControllers).length +
      Object.keys(threadState._abortControllers).length,
    activeTimers: _activeTimers.size,
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
