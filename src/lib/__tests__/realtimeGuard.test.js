import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));

const mockRemoveChannel = vi.fn();
const mockGetChannels = vi.fn(() => []);

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    getChannels: mockGetChannels,
    removeChannel: mockRemoveChannel,
  }),
}));

const { runHeartbeat, startHeartbeat, stopHeartbeat } = await import('@/lib/realtimeGuard');

describe('realtimeGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stopHeartbeat();
  });

  afterEach(() => {
    stopHeartbeat();
  });

  describe('runHeartbeat', () => {
    it('returns true when all channels are healthy', () => {
      mockGetChannels.mockReturnValue([
        { topic: 'realtime:dms:123', state: 'joined' },
        { topic: 'realtime:notifications:123', state: 'joined' },
      ]);
      expect(runHeartbeat()).toBe(true);
      expect(mockRemoveChannel).not.toHaveBeenCalled();
    });

    it('returns true when no channels exist', () => {
      mockGetChannels.mockReturnValue([]);
      expect(runHeartbeat()).toBe(true);
    });

    it('detects and removes errored channels', () => {
      const erroredChannel = { topic: 'realtime:dms:123', state: 'errored' };
      mockGetChannels.mockReturnValue([erroredChannel]);
      expect(runHeartbeat()).toBe(false);
      expect(mockRemoveChannel).toHaveBeenCalledWith(erroredChannel);
    });

    it('detects and removes closed channels', () => {
      const closedChannel = { topic: 'realtime:notifications:456', state: 'closed' };
      mockGetChannels.mockReturnValue([closedChannel]);
      expect(runHeartbeat()).toBe(false);
      expect(mockRemoveChannel).toHaveBeenCalledWith(closedChannel);
    });

    it('only removes unhealthy channels, leaves healthy ones', () => {
      const healthy = { topic: 'realtime:dms:123', state: 'joined' };
      const dead = { topic: 'realtime:notifications:456', state: 'closed' };
      mockGetChannels.mockReturnValue([healthy, dead]);
      runHeartbeat();
      expect(mockRemoveChannel).toHaveBeenCalledTimes(1);
      expect(mockRemoveChannel).toHaveBeenCalledWith(dead);
    });
  });

  describe('startHeartbeat / stopHeartbeat', () => {
    it('starts and stops without errors', () => {
      expect(() => startHeartbeat()).not.toThrow();
      expect(() => stopHeartbeat()).not.toThrow();
    });

    it('does not start twice', () => {
      startHeartbeat();
      startHeartbeat(); // second call is no-op
      stopHeartbeat();
    });
  });
});
