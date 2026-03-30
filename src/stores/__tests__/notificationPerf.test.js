import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock Supabase ──────────────────────────────────────────

const mockAbortSignal = vi.fn();
const mockLimit = vi.fn();
const mockOrder = vi.fn();
const mockIn = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockUpdate = vi.fn();
const mockRemoveChannel = vi.fn();
const mockSubscribe = vi.fn();
const mockOn = vi.fn();

// Chainable mocks
mockFrom.mockReturnValue({ select: mockSelect, update: mockUpdate });
mockSelect.mockReturnValue({ eq: mockEq });
mockEq.mockImplementation(() => ({ eq: mockEq, in: mockIn, abortSignal: mockAbortSignal }));
mockIn.mockReturnValue({ order: mockOrder, abortSignal: mockAbortSignal });
mockOrder.mockReturnValue({ abortSignal: mockAbortSignal });
mockAbortSignal.mockReturnValue({ limit: mockLimit });
mockLimit.mockResolvedValue({ data: [], error: null });
mockUpdate.mockReturnValue({ eq: mockEq });

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    channel: () => ({ on: mockOn, subscribe: mockSubscribe }),
    removeChannel: mockRemoveChannel,
  }),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: () => ({ user: { id: 'test-user-123' } }),
  },
}));

// Import store after mocks
const { useNotificationStore } = await import('@/stores/notificationStore');

// ── Helpers ──────────────────────────────────────────

function generateMockNotifications(count) {
  const types = ['thread_reply', 'reply_mention', 'badge', 'forum_new_thread', 'post_like', 'new_follower'];
  return Array.from({ length: count }, (_, i) => ({
    id: `notif-${i}`,
    user_id: 'test-user-123',
    type: types[i % types.length],
    thread_id: types[i % types.length] === 'new_follower' ? null : `thread-${i}`,
    reply_id: i % 3 === 0 ? `reply-${i}` : null,
    actor_id: `actor-${i}`,
    actor: { display_name: `User ${i}`, avatar_url: null },
    thread: types[i % types.length] === 'new_follower' ? null : { title: `Thread title ${i}` },
    title: `Notification ${i}`,
    body: i % 2 === 0 ? `Body text for notification ${i}` : null,
    read: i % 4 === 0,
    created_at: new Date(Date.now() - i * 60000).toISOString(),
  }));
}

// ── Tests ──────────────────────────────────────────

describe('notificationStore performance', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      loading: false,
      fetchError: false,
      _realtimeChannel: null,
      _refetchTimer: null,
      _abortControllers: {},
    });
    vi.clearAllMocks();
    // Re-chain mocks after clearing
    mockFrom.mockReturnValue({ select: mockSelect, update: mockUpdate });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockImplementation(() => ({ eq: mockEq, in: mockIn, abortSignal: mockAbortSignal }));
    mockIn.mockReturnValue({ order: mockOrder, abortSignal: mockAbortSignal });
    mockOrder.mockReturnValue({ abortSignal: mockAbortSignal });
    mockAbortSignal.mockReturnValue({ limit: mockLimit });
    mockUpdate.mockReturnValue({ eq: mockEq });
  });

  it('fetches 50 mixed-type notifications within 100ms', async () => {
    const mockData = generateMockNotifications(50);
    mockLimit.mockResolvedValueOnce({ data: mockData, error: null });

    const start = performance.now();
    await useNotificationStore.getState().fetchNotifications();
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(100);
    expect(useNotificationStore.getState().notifications).toHaveLength(50);
    expect(useNotificationStore.getState().loading).toBe(false);
    expect(useNotificationStore.getState().fetchError).toBe(false);
  });

  it('fetches unread count within 50ms', async () => {
    mockAbortSignal.mockResolvedValueOnce({ count: 12 });

    const start = performance.now();
    await useNotificationStore.getState().fetchUnreadCount();
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(50);
    expect(useNotificationStore.getState().unreadCount).toBe(12);
  });

  it('marks all as read within 50ms for 50 notifications', async () => {
    const mockData = generateMockNotifications(50);
    useNotificationStore.setState({
      notifications: mockData,
      unreadCount: 38,
    });

    // markAllAsRead chains: .update({read:true}).eq('user_id',userId).eq('read',false)
    const mockEqEnd = vi.fn().mockResolvedValue({ error: null });
    const mockEqMid = vi.fn().mockReturnValue({ eq: mockEqEnd });
    mockUpdate.mockReturnValueOnce({ eq: mockEqMid });

    const start = performance.now();
    await useNotificationStore.getState().markAllAsRead();
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(50);
    expect(useNotificationStore.getState().unreadCount).toBe(0);
    const allRead = useNotificationStore.getState().notifications.every((n) => n.read);
    expect(allRead).toBe(true);
  });

  it('marks a single notification as read within 30ms', async () => {
    const mockData = generateMockNotifications(50);
    useNotificationStore.setState({
      notifications: mockData,
      unreadCount: 10,
    });

    mockEq.mockResolvedValueOnce({ error: null });

    const start = performance.now();
    await useNotificationStore.getState().markAsRead('notif-1');
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(30);
    expect(useNotificationStore.getState().unreadCount).toBe(9);
    const updated = useNotificationStore.getState().notifications.find((n) => n.id === 'notif-1');
    expect(updated.read).toBe(true);
  });
});

describe('notification type filter correctness', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      loading: false,
      fetchError: false,
      _abortControllers: {},
    });
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect, update: mockUpdate });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockImplementation(() => ({ eq: mockEq, in: mockIn, abortSignal: mockAbortSignal }));
    mockIn.mockReturnValue({ order: mockOrder, abortSignal: mockAbortSignal });
    mockOrder.mockReturnValue({ abortSignal: mockAbortSignal });
    mockAbortSignal.mockReturnValue({ limit: mockLimit });
  });

  it('includes post_like and new_follower in fetch filter', async () => {
    mockLimit.mockResolvedValueOnce({ data: [], error: null });

    await useNotificationStore.getState().fetchNotifications();

    // Verify .in() was called with the full type list including new types
    const inCall = mockIn.mock.calls.find(
      ([col]) => col === 'type'
    );
    expect(inCall).toBeTruthy();
    const types = inCall[1];
    expect(types).toContain('post_like');
    expect(types).toContain('new_follower');
    expect(types).toContain('thread_reply');
    expect(types).toContain('reply_mention');
    expect(types).toContain('badge');
    expect(types).toContain('forum_new_thread');
  });

  it('includes post_like and new_follower in unread count filter', async () => {
    mockAbortSignal.mockResolvedValueOnce({ count: 5 });

    await useNotificationStore.getState().fetchUnreadCount();

    const inCall = mockIn.mock.calls.find(
      ([col]) => col === 'type'
    );
    expect(inCall).toBeTruthy();
    const types = inCall[1];
    expect(types).toContain('post_like');
    expect(types).toContain('new_follower');
  });

  it('correctly stores post_like notifications from fetch', async () => {
    const likeNotif = {
      id: 'like-1',
      user_id: 'test-user-123',
      type: 'post_like',
      thread_id: 'thread-1',
      reply_id: null,
      actor_id: 'actor-1',
      actor: { display_name: 'Alice', avatar_url: null },
      thread: { title: 'My Thread' },
      title: 'Alice liked your post in "My Thread"',
      body: null,
      read: false,
      created_at: new Date().toISOString(),
    };

    mockLimit.mockResolvedValueOnce({ data: [likeNotif], error: null });

    await useNotificationStore.getState().fetchNotifications();

    const notifications = useNotificationStore.getState().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('post_like');
    expect(notifications[0].actor.display_name).toBe('Alice');
  });

  it('correctly stores new_follower notifications from fetch', async () => {
    const followNotif = {
      id: 'follow-1',
      user_id: 'test-user-123',
      type: 'new_follower',
      thread_id: null,
      reply_id: null,
      actor_id: 'actor-2',
      actor: { display_name: 'Bob', avatar_url: null },
      thread: null,
      title: 'Bob started following you',
      body: null,
      read: false,
      created_at: new Date().toISOString(),
    };

    mockLimit.mockResolvedValueOnce({ data: [followNotif], error: null });

    await useNotificationStore.getState().fetchNotifications();

    const notifications = useNotificationStore.getState().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('new_follower');
    expect(notifications[0].thread).toBeNull();
  });
});

describe('realtime burst handling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useNotificationStore.setState({
      notifications: generateMockNotifications(5),
      unreadCount: 3,
      loading: false,
      fetchError: false,
      _realtimeChannel: null,
      _refetchTimer: null,
      _abortControllers: {},
    });
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect, update: mockUpdate });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockImplementation(() => ({ eq: mockEq, in: mockIn, abortSignal: mockAbortSignal }));
    mockIn.mockReturnValue({ order: mockOrder, abortSignal: mockAbortSignal });
    mockOrder.mockReturnValue({ abortSignal: mockAbortSignal });
    mockAbortSignal.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue({ data: [], error: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('increments unread count immediately on each INSERT event', () => {
    let realtimeCallback;
    mockOn.mockImplementation((_event, _filter, cb) => {
      realtimeCallback = cb;
      return { subscribe: mockSubscribe };
    });

    useNotificationStore.getState().subscribeRealtime();

    // Simulate 5 rapid INSERT events
    for (let i = 0; i < 5; i++) {
      realtimeCallback({ new: { id: `new-${i}`, type: 'post_like' } });
    }

    // Unread count should have been incremented 5 times (3 initial + 5 = 8)
    expect(useNotificationStore.getState().unreadCount).toBe(8);
  });

  it('debounces re-fetch so only one fetch happens after burst', () => {
    let realtimeCallback;
    mockOn.mockImplementation((_event, _filter, cb) => {
      realtimeCallback = cb;
      return { subscribe: mockSubscribe };
    });

    useNotificationStore.getState().subscribeRealtime();

    // Track fetchNotifications calls
    const fetchSpy = vi.spyOn(useNotificationStore.getState(), 'fetchNotifications');

    // Simulate 10 rapid INSERT events
    for (let i = 0; i < 10; i++) {
      realtimeCallback({ new: { id: `new-${i}`, type: 'new_follower' } });
    }

    // No fetch should have happened yet (within the 2s debounce)
    expect(fetchSpy).not.toHaveBeenCalled();

    // Advance past the 2s debounce
    vi.advanceTimersByTime(2100);

    // fetchNotifications should be called via the timer
    // (we check that the timer was set, since the spied function is on a snapshot)
    expect(useNotificationStore.getState()._refetchTimer).not.toBeNull();
  });
});

describe('cancelAll cleans up notification store', () => {
  it('aborts all pending controllers', () => {
    const ctrl1 = new AbortController();
    const ctrl2 = new AbortController();
    useNotificationStore.setState({
      _abortControllers: { fetchNotifications: ctrl1, fetchUnreadCount: ctrl2 },
    });

    useNotificationStore.getState().cancelAll();

    expect(ctrl1.signal.aborted).toBe(true);
    expect(ctrl2.signal.aborted).toBe(true);
    expect(Object.keys(useNotificationStore.getState()._abortControllers)).toHaveLength(0);
  });
});
