import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let acquireNavigationLock, releaseNavigationLock, isNavigating;

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  const mod = await import('@/lib/navigationLock');
  acquireNavigationLock = mod.acquireNavigationLock;
  releaseNavigationLock = mod.releaseNavigationLock;
  isNavigating = mod.isNavigating;
  // Ensure clean state
  releaseNavigationLock();
});

afterEach(() => {
  releaseNavigationLock();
  vi.useRealTimers();
});

describe('navigationLock', () => {
  it('acquires lock successfully', () => {
    expect(acquireNavigationLock()).toBe(true);
    expect(isNavigating()).toBe(true);
  });

  it('blocks second acquire while locked', () => {
    expect(acquireNavigationLock()).toBe(true);
    expect(acquireNavigationLock()).toBe(false);
  });

  it('allows acquire after release', () => {
    acquireNavigationLock();
    releaseNavigationLock();
    expect(acquireNavigationLock()).toBe(true);
  });

  it('auto-releases after 1.5 seconds', () => {
    acquireNavigationLock();
    expect(isNavigating()).toBe(true);

    vi.advanceTimersByTime(1499);
    expect(isNavigating()).toBe(true);

    vi.advanceTimersByTime(2);
    expect(isNavigating()).toBe(false);
  });

  it('release clears the auto-release timer', () => {
    acquireNavigationLock();
    releaseNavigationLock();

    // Even after 3s, no error from dangling timer
    vi.advanceTimersByTime(3000);
    expect(isNavigating()).toBe(false);
  });
});
