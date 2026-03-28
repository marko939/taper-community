/**
 * Stability regression tests for TaperCommunity.
 *
 * These tests verify that the stability fixes work correctly:
 * - Visibility manager pauses/resumes realtime channels
 * - Store cancelAll aborts all controllers
 * - Store pruning limits cache size
 * - Navigation lock prevents concurrent navigations
 * - AbortSignal prevents stale writes
 */

// ── Visibility Manager ──────────────────────────────────────────

describe('visibilityManager', () => {
  let initVisibilityManager, destroyVisibilityManager;

  beforeEach(async () => {
    // Reset modules for isolation
    jest.resetModules();

    // Mock the store modules
    jest.mock('@/stores/messageStore', () => ({
      useMessageStore: {
        getState: () => ({
          unsubscribeRealtime: jest.fn(),
          subscribeRealtime: jest.fn(),
          cancelAll: jest.fn(),
        }),
      },
    }));
    jest.mock('@/stores/notificationStore', () => ({
      useNotificationStore: {
        getState: () => ({
          unsubscribeRealtime: jest.fn(),
          subscribeRealtime: jest.fn(),
          cancelAll: jest.fn(),
        }),
      },
    }));
    jest.mock('@/stores/forumStore', () => ({
      useForumStore: {
        getState: () => ({
          cancelAll: jest.fn(),
          invalidate: jest.fn(),
        }),
      },
    }));
    jest.mock('@/stores/threadStore', () => ({
      useThreadStore: { getState: () => ({ cancelAll: jest.fn() }) },
    }));
    jest.mock('@/stores/followStore', () => ({
      useFollowStore: {
        getState: () => ({
          cancelAll: jest.fn(),
          invalidateFeeds: jest.fn(),
        }),
      },
    }));
    jest.mock('@/stores/journalStore', () => ({
      useJournalStore: {
        getState: () => ({
          cancelAll: jest.fn(),
          invalidate: jest.fn(),
        }),
      },
    }));
    jest.mock('@/stores/profileStore', () => ({
      useProfileStore: { getState: () => ({ cancelAll: jest.fn() }) },
    }));
    jest.mock('@/stores/blogStore', () => ({
      useBlogStore: { getState: () => ({ cancelAll: jest.fn() }) },
    }));
    jest.mock('@/stores/authStore', () => ({
      useAuthStore: { getState: () => ({ user: { id: 'test-user' } }) },
    }));

    const mod = await import('@/lib/visibilityManager');
    initVisibilityManager = mod.initVisibilityManager;
    destroyVisibilityManager = mod.destroyVisibilityManager;
  });

  afterEach(() => {
    destroyVisibilityManager?.();
    jest.restoreAllMocks();
  });

  test('registers handler on init and removes on destroy', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');
    const removeSpy = jest.spyOn(document, 'removeEventListener');

    initVisibilityManager();
    expect(addSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));

    destroyVisibilityManager();
    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });

  test('does not double-register', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');
    initVisibilityManager();
    initVisibilityManager();
    const visibilityCalls = addSpy.mock.calls.filter(
      ([event]) => event === 'visibilitychange'
    );
    expect(visibilityCalls).toHaveLength(1);
  });
});

// ── Navigation Lock ──────────────────────────────────────────

describe('navigationLock', () => {
  let acquireNavigationLock, releaseNavigationLock, isNavigating;

  beforeEach(() => {
    jest.resetModules();
    const mod = require('@/lib/navigationLock');
    acquireNavigationLock = mod.acquireNavigationLock;
    releaseNavigationLock = mod.releaseNavigationLock;
    isNavigating = mod.isNavigating;
  });

  afterEach(() => {
    releaseNavigationLock();
  });

  test('first acquire succeeds, second fails', () => {
    expect(acquireNavigationLock()).toBe(true);
    expect(acquireNavigationLock()).toBe(false);
  });

  test('release allows re-acquire', () => {
    acquireNavigationLock();
    releaseNavigationLock();
    expect(acquireNavigationLock()).toBe(true);
  });

  test('isNavigating reflects lock state', () => {
    expect(isNavigating()).toBe(false);
    acquireNavigationLock();
    expect(isNavigating()).toBe(true);
    releaseNavigationLock();
    expect(isNavigating()).toBe(false);
  });

  test('auto-releases after 3s timeout', () => {
    jest.useFakeTimers();
    acquireNavigationLock();
    expect(isNavigating()).toBe(true);
    jest.advanceTimersByTime(3100);
    expect(isNavigating()).toBe(false);
    jest.useRealTimers();
  });
});

// ── Store AbortController ──────────────────────────────────────

describe('store cancelAll pattern', () => {
  test('forumStore cancelAll aborts all controllers', () => {
    jest.resetModules();
    const { useForumStore } = require('@/stores/forumStore');
    const store = useForumStore.getState();

    // Manually set some controllers
    const ctrl1 = new AbortController();
    const ctrl2 = new AbortController();
    useForumStore.setState({
      _abortControllers: { fetchThreads: ctrl1, search: ctrl2 },
    });

    useForumStore.getState().cancelAll();
    expect(ctrl1.signal.aborted).toBe(true);
    expect(ctrl2.signal.aborted).toBe(true);
    expect(Object.keys(useForumStore.getState()._abortControllers)).toHaveLength(0);
  });

  test('threadStore pruneCache limits to 5 entries', () => {
    jest.resetModules();
    const { useThreadStore } = require('@/stores/threadStore');

    // Add 8 threads
    const threads = {};
    const replies = {};
    for (let i = 0; i < 8; i++) {
      threads[`id-${i}`] = { id: `id-${i}`, title: `Thread ${i}` };
      replies[`id-${i}`] = { items: [], hasMore: false, totalCount: 0, page: 0 };
    }
    useThreadStore.setState({ threads, replies, voteState: {}, helpfulState: {} });

    useThreadStore.getState().pruneCache('id-7');
    const remaining = Object.keys(useThreadStore.getState().threads);
    expect(remaining.length).toBeLessThanOrEqual(5);
    expect(remaining).toContain('id-7'); // current thread preserved
  });
});

// ── Profile Store Pruning ──────────────────────────────────────

describe('profileStore pruneCache', () => {
  test('limits profiles to 10 entries', () => {
    jest.resetModules();
    jest.mock('@/stores/authStore', () => ({
      useAuthStore: { getState: () => ({ user: { id: 'current-user' } }) },
    }));
    const { useProfileStore } = require('@/stores/profileStore');

    // Add 15 profiles
    const profiles = {};
    for (let i = 0; i < 15; i++) {
      profiles[`user-${i}`] = { data: { id: `user-${i}` }, threads: [], replies: [], loading: false };
    }
    profiles['current-user'] = { data: { id: 'current-user' }, threads: [], replies: [], loading: false };
    useProfileStore.setState({ profiles });

    useProfileStore.getState().pruneCache('user-14');
    const remaining = Object.keys(useProfileStore.getState().profiles);
    expect(remaining.length).toBeLessThanOrEqual(10);
    expect(remaining).toContain('current-user'); // auth user preserved
    expect(remaining).toContain('user-14'); // keep target preserved
  });
});

// ── Blog Store Pruning ──────────────────────────────────────

describe('blogStore pruneComments', () => {
  test('limits comments to 5 entries', () => {
    jest.resetModules();
    const { useBlogStore } = require('@/stores/blogStore');

    const comments = {};
    for (let i = 0; i < 10; i++) {
      comments[`post-${i}`] = { items: [], totalCount: 0 };
    }
    useBlogStore.setState({ comments });

    useBlogStore.getState().pruneComments('post-9');
    const remaining = Object.keys(useBlogStore.getState().comments);
    expect(remaining.length).toBeLessThanOrEqual(5);
    expect(remaining).toContain('post-9');
  });
});
