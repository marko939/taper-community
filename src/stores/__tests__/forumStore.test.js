import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
const mockRange = vi.fn();
const mockAbortSignal = vi.fn(() => ({ range: mockRange }));
const mockOrder2 = vi.fn(() => ({ abortSignal: mockAbortSignal }));
const mockOrder = vi.fn(() => ({ order: mockOrder2 }));
const mockEq = vi.fn(() => ({ order: mockOrder }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: mockFrom }),
}));

// Import store after mocks
const { useForumStore } = await import('@/stores/forumStore');

describe('forumStore.loadMoreThreads', () => {
  const forumId = 'test-forum-123';

  beforeEach(() => {
    // Reset store state
    useForumStore.setState({
      threadPages: {},
      _abortControllers: {},
    });
    vi.clearAllMocks();
  });

  it('should return early if no current page data exists', async () => {
    await useForumStore.getState().loadMoreThreads(forumId);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('should return early if forumId is falsy', async () => {
    await useForumStore.getState().loadMoreThreads(null);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('should return early if already loading (loading guard)', async () => {
    useForumStore.setState({
      threadPages: {
        [forumId]: {
          items: [{ id: '1' }],
          hasMore: true,
          totalCount: 40,
          page: 0,
          loading: true,
        },
      },
    });

    await useForumStore.getState().loadMoreThreads(forumId);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('should append new items to existing items on success', async () => {
    const existingItems = [{ id: '1' }, { id: '2' }];
    const newItems = [{ id: '3' }, { id: '4' }];

    useForumStore.setState({
      threadPages: {
        [forumId]: {
          items: existingItems,
          hasMore: true,
          totalCount: 40,
          page: 0,
          loading: false,
        },
      },
      _abortControllers: {},
      cancelPending: vi.fn(),
    });

    mockRange.mockResolvedValueOnce({ data: newItems, count: 40 });

    await useForumStore.getState().loadMoreThreads(forumId);

    const state = useForumStore.getState().threadPages[forumId];
    expect(state.items).toHaveLength(4);
    expect(state.items[2].id).toBe('3');
    expect(state.items[3].id).toBe('4');
    expect(state.page).toBe(1);
    expect(state.loading).toBe(false);
  });

  it('should set hasMore to false when all items loaded', async () => {
    useForumStore.setState({
      threadPages: {
        [forumId]: {
          items: Array(20).fill({ id: 'x' }),
          hasMore: true,
          totalCount: 40,
          page: 0,
          loading: false,
        },
      },
      _abortControllers: {},
      cancelPending: vi.fn(),
    });

    // Return exactly 20 items, total = 40. from=20, 20+20 < 40 is false
    mockRange.mockResolvedValueOnce({
      data: Array(20).fill({ id: 'y' }),
      count: 40,
    });

    await useForumStore.getState().loadMoreThreads(forumId);

    const state = useForumStore.getState().threadPages[forumId];
    expect(state.hasMore).toBe(false);
  });

  it('should handle network errors gracefully (no crash)', async () => {
    useForumStore.setState({
      threadPages: {
        [forumId]: {
          items: [{ id: '1' }],
          hasMore: true,
          totalCount: 40,
          page: 0,
          loading: false,
        },
      },
      _abortControllers: {},
      cancelPending: vi.fn(),
    });

    mockRange.mockRejectedValueOnce(new Error('Network error'));

    // Should not throw
    await useForumStore.getState().loadMoreThreads(forumId);

    const state = useForumStore.getState().threadPages[forumId];
    expect(state.loading).toBe(false);
    // Items should be unchanged
    expect(state.items).toHaveLength(1);
  });

  it('should silently ignore AbortError', async () => {
    useForumStore.setState({
      threadPages: {
        [forumId]: {
          items: [{ id: '1' }],
          hasMore: true,
          totalCount: 40,
          page: 0,
          loading: false,
        },
      },
      _abortControllers: {},
      cancelPending: vi.fn(),
    });

    const abortError = new DOMException('The operation was aborted', 'AbortError');
    mockRange.mockRejectedValueOnce(abortError);

    await useForumStore.getState().loadMoreThreads(forumId);
    // Should not update loading to false for AbortError (early return)
  });
});
