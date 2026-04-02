import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Set env before any imports so the adapter doesn't short-circuit
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');

// Mock @vercel/analytics to prevent import errors in test env
vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));

let subscribeWithFallback, unsubscribeWithFallback, isPollingMode, resetWsTest;

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  const mod = await import('@/lib/realtimeAdapter');
  subscribeWithFallback = mod.subscribeWithFallback;
  unsubscribeWithFallback = mod.unsubscribeWithFallback;
  isPollingMode = mod.isPollingMode;
  resetWsTest = mod.resetWsTest;
  resetWsTest();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('realtimeAdapter', () => {
  describe('subscribeWithFallback — WS available', () => {
    it('calls subscribeFn when WebSocket works', async () => {
      const MockWS = vi.fn().mockImplementation(function () {
        setTimeout(() => this.onopen?.(), 10);
        this.close = vi.fn();
      });
      vi.stubGlobal('WebSocket', MockWS);

      const subscribeFn = vi.fn();
      const pollFn = vi.fn();

      const promise = subscribeWithFallback('test', subscribeFn, pollFn);
      vi.advanceTimersByTime(100);
      await promise;

      expect(subscribeFn).toHaveBeenCalledOnce();
      expect(pollFn).not.toHaveBeenCalled();
      expect(isPollingMode()).toBe(false);
    });
  });

  describe('subscribeWithFallback — WS blocked', () => {
    it('falls back to polling when WebSocket fails', async () => {
      const MockWS = vi.fn().mockImplementation(function () {
        setTimeout(() => this.onerror?.(), 10);
        this.close = vi.fn();
      });
      vi.stubGlobal('WebSocket', MockWS);

      const subscribeFn = vi.fn();
      const pollFn = vi.fn();

      const promise = subscribeWithFallback('test', subscribeFn, pollFn, 1000);
      vi.advanceTimersByTime(100);
      await promise;

      expect(subscribeFn).not.toHaveBeenCalled();
      expect(pollFn).toHaveBeenCalledOnce(); // immediate first poll
      expect(isPollingMode()).toBe(true);

      // Advance to trigger polling interval
      vi.advanceTimersByTime(1000);
      expect(pollFn).toHaveBeenCalledTimes(2);
    });

    it('falls back when WebSocket constructor throws', async () => {
      vi.stubGlobal('WebSocket', vi.fn().mockImplementation(() => {
        throw new Error('Blocked by browser');
      }));

      const subscribeFn = vi.fn();
      const pollFn = vi.fn();

      const promise = subscribeWithFallback('test', subscribeFn, pollFn);
      vi.advanceTimersByTime(100);
      await promise;

      expect(subscribeFn).not.toHaveBeenCalled();
      expect(isPollingMode()).toBe(true);
    });
  });

  describe('unsubscribeWithFallback', () => {
    it('clears polling interval', async () => {
      const MockWS = vi.fn().mockImplementation(function () {
        setTimeout(() => this.onerror?.(), 10);
        this.close = vi.fn();
      });
      vi.stubGlobal('WebSocket', MockWS);

      const pollFn = vi.fn();
      const unsubFn = vi.fn();
      const promise = subscribeWithFallback('test', vi.fn(), pollFn, 1000);
      vi.advanceTimersByTime(100);
      await promise;

      unsubscribeWithFallback('test', unsubFn);
      const callCount = pollFn.mock.calls.length;

      vi.advanceTimersByTime(5000);
      expect(pollFn.mock.calls.length).toBe(callCount); // no more polls
      expect(unsubFn).toHaveBeenCalledOnce();
    });
  });
});
