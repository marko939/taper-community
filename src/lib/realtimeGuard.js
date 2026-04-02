/**
 * Realtime Guard — detects and recovers from silent WebSocket death.
 *
 * Safari aggressively suspends WebSocket connections in background tabs.
 * When the tab returns, Supabase channels appear subscribed but are dead.
 * This guard monitors channel health and forces reconnection when needed.
 *
 * Feature flag: NEXT_PUBLIC_REALTIME_GUARD (default: true)
 */

import { createClient } from '@/lib/supabase/client';
import { track } from '@vercel/analytics';

let _heartbeatInterval = null;
let _initialized = false;
let _visibilityHandler = null;

/**
 * Check all active Supabase channels and return any that are unhealthy.
 * A channel is unhealthy if it's in 'errored' or 'closed' state.
 */
export function getUnhealthyChannels() {
  const supabase = createClient();
  const channels = supabase.getChannels();
  return channels.filter(
    (ch) => ch.state === 'errored' || ch.state === 'closed'
  );
}

/**
 * Run a single heartbeat check. Returns true if all channels are healthy.
 */
export function runHeartbeat() {
  if (process.env.NEXT_PUBLIC_REALTIME_GUARD === 'false') return true;

  const unhealthy = getUnhealthyChannels();
  if (unhealthy.length === 0) return true;

  const supabase = createClient();
  for (const ch of unhealthy) {
    console.warn(`[realtimeGuard] WS DEAD: ${ch.topic} (state: ${ch.state}) — removing`);
    try { track('realtime_reconnect', { channel: ch.topic, state: ch.state }); } catch {}
    try {
      supabase.removeChannel(ch);
    } catch (e) {
      console.warn('[realtimeGuard] removeChannel error:', e);
    }
  }

  // Return false so caller knows reconnection is needed
  return false;
}

/**
 * Start the background heartbeat (30s interval).
 * Called once from StoreInitializer.
 */
export function startHeartbeat() {
  if (typeof window === 'undefined') return;
  if (process.env.NEXT_PUBLIC_REALTIME_GUARD === 'false') return;
  if (_initialized) return;

  _heartbeatInterval = setInterval(() => {
    runHeartbeat();
  }, 30000);

  // Pause heartbeat while tab is hidden — Safari marks backgrounded WS
  // channels as errored, and removing them here creates zombie state
  // because stores still hold stale channel refs.
  _visibilityHandler = () => {
    if (document.hidden) {
      if (_heartbeatInterval) {
        clearInterval(_heartbeatInterval);
        _heartbeatInterval = null;
      }
    } else {
      if (!_heartbeatInterval) {
        runHeartbeat();
        _heartbeatInterval = setInterval(() => {
          runHeartbeat();
        }, 30000);
      }
    }
  };
  document.addEventListener('visibilitychange', _visibilityHandler);

  // Clean up on page unload
  window.addEventListener('beforeunload', stopHeartbeat);
  _initialized = true;
}

/**
 * Stop the background heartbeat.
 */
export function stopHeartbeat() {
  if (_heartbeatInterval) {
    clearInterval(_heartbeatInterval);
    _heartbeatInterval = null;
  }
  if (_visibilityHandler) {
    document.removeEventListener('visibilitychange', _visibilityHandler);
    _visibilityHandler = null;
  }
  _initialized = false;
}
