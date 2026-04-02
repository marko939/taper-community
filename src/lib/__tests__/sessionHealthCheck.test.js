import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));

import { checkSessionHealth } from '@/lib/sessionHealthCheck';

describe('checkSessionHealth', () => {
  let dispatched;

  beforeEach(() => {
    dispatched = [];
    vi.spyOn(window, 'dispatchEvent').mockImplementation((event) => {
      dispatched.push(event.type);
    });
  });

  it('returns true when user was never authenticated', () => {
    expect(checkSessionHealth(null, false)).toBe(true);
    expect(dispatched).toHaveLength(0);
  });

  it('returns true for valid non-expired session', () => {
    const session = {
      user: { id: '123' },
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };
    expect(checkSessionHealth(session, true)).toBe(true);
    expect(dispatched).toHaveLength(0);
  });

  it('dispatches session-expired when session is null but user was authenticated', () => {
    expect(checkSessionHealth(null, true)).toBe(false);
    expect(dispatched).toContain('taper:session-expired');
  });

  it('dispatches session-expired when session has no user', () => {
    expect(checkSessionHealth({}, true)).toBe(false);
    expect(dispatched).toContain('taper:session-expired');
  });

  it('dispatches session-expired when session is expired', () => {
    const session = {
      user: { id: '123' },
      expires_at: Math.floor(Date.now() / 1000) - 60, // 1 minute ago
    };
    expect(checkSessionHealth(session, true)).toBe(false);
    expect(dispatched).toContain('taper:session-expired');
  });

  it('returns true when expires_at is not set (no expiry info)', () => {
    const session = { user: { id: '123' } };
    expect(checkSessionHealth(session, true)).toBe(true);
    expect(dispatched).toHaveLength(0);
  });
});
