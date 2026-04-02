import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateId, scheduleIdle } from '@/lib/compat';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('generateId', () => {
  it('returns a valid UUID v4 string', () => {
    const id = generateId();
    expect(id).toMatch(UUID_REGEX);
  });

  it('returns unique IDs on successive calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it('works when crypto.randomUUID is unavailable', () => {
    const orig = crypto.randomUUID;
    crypto.randomUUID = undefined;
    const id = generateId();
    expect(id).toMatch(UUID_REGEX);
    crypto.randomUUID = orig;
  });
});

describe('scheduleIdle', () => {
  it('calls the callback', async () => {
    const cb = vi.fn();
    scheduleIdle(cb);
    await new Promise((r) => setTimeout(r, 50));
    expect(cb).toHaveBeenCalledOnce();
  });

  it('works when requestIdleCallback is unavailable', async () => {
    const orig = window.requestIdleCallback;
    delete window.requestIdleCallback;
    const cb = vi.fn();
    scheduleIdle(cb);
    await new Promise((r) => setTimeout(r, 50));
    expect(cb).toHaveBeenCalledOnce();
    if (orig) window.requestIdleCallback = orig;
  });
});
