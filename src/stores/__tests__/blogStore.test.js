import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ensureSession
const mockEnsureSession = vi.fn();
vi.mock('@/lib/ensureSession', () => ({
  ensureSession: (...args) => mockEnsureSession(...args),
}));

// Mock fireAndForget
vi.mock('@/lib/fireAndForget', () => ({
  fireAndForget: vi.fn(),
}));

// Mock Supabase
const mockSingle = vi.fn();
const mockSelectInsert = vi.fn(() => ({ single: mockSingle }));
const mockInsert = vi.fn(() => ({ select: mockSelectInsert }));
const mockFrom = vi.fn(() => ({ insert: mockInsert }));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: mockFrom }),
}));

// Mock authStore
vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: () => ({ user: { id: 'user-123' } }),
  },
}));

const { useBlogStore } = await import('@/stores/blogStore');

describe('blogStore.addComment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureSession.mockResolvedValue(undefined);
    useBlogStore.setState({ comments: {} });
  });

  it('should throw if user is not signed in', async () => {
    const { useAuthStore } = await import('@/stores/authStore');
    const original = useAuthStore.getState;
    useAuthStore.getState = () => ({ user: null });

    await expect(
      useBlogStore.getState().addComment('post-1', 'Hello')
    ).rejects.toThrow('sign in');

    useAuthStore.getState = original;
  });

  it('should throw if body is empty', async () => {
    await expect(
      useBlogStore.getState().addComment('post-1', '   ')
    ).rejects.toThrow('empty');
  });

  it('should throw user-friendly error when ensureSession times out', async () => {
    mockEnsureSession.mockRejectedValueOnce(new Error('Request timed out'));

    await expect(
      useBlogStore.getState().addComment('post-1', 'Hello')
    ).rejects.toThrow('Session expired');
  });

  it('should insert comment and update local state on success', async () => {
    const mockComment = {
      id: 'comment-1',
      blog_post_id: 'post-1',
      user_id: 'user-123',
      body: 'Great article!',
      profiles: { display_name: 'Test User' },
    };
    mockSingle.mockResolvedValueOnce({ data: mockComment, error: null });

    const result = await useBlogStore.getState().addComment('post-1', 'Great article!');

    expect(result).toEqual(mockComment);
    const state = useBlogStore.getState().comments['post-1'];
    expect(state.items).toHaveLength(1);
    expect(state.items[0].body).toBe('Great article!');
    expect(state.totalCount).toBe(1);
  });

  it('should throw on Supabase insert error', async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'RLS policy violation' },
    });

    await expect(
      useBlogStore.getState().addComment('post-1', 'Hello')
    ).rejects.toThrow('RLS policy violation');
  });
});
