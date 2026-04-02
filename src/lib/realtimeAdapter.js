/**
 * Realtime Adapter — WebSocket with polling fallback for Brave browser.
 *
 * Brave Shields may block WebSocket connections to Supabase realtime.
 * This adapter tests WS connectivity once, then transparently falls back
 * to polling when WebSockets are unavailable.
 *
 * Feature flag: NEXT_PUBLIC_BRAVE_POLLING (default: true)
 */

import { track } from '@vercel/analytics';

let _wsAvailable = null; // null = untested, true/false = tested
let _wsTestPromise = null;
const _pollingIntervals = new Map(); // storeName → intervalId

/**
 * Test WebSocket connectivity to Supabase realtime endpoint.
 * Caches the result for the session lifetime.
 */
export function testWebSocketAvailability() {
  if (_wsAvailable !== null) return Promise.resolve(_wsAvailable);
  if (_wsTestPromise) return _wsTestPromise;

  const realtimeUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!realtimeUrl) {
    _wsAvailable = true;
    return Promise.resolve(true);
  }

  // Convert https:// to wss:// for the realtime endpoint
  const wsUrl = realtimeUrl
    .replace(/^https?:\/\//, 'wss://')
    .replace(/\/$/, '') + '/realtime/v1/websocket?vsn=1.0.0';

  _wsTestPromise = new Promise((resolve) => {
    const timeout = setTimeout(() => {
      _wsAvailable = false;
      try { ws.close(); } catch {}
      console.warn('[realtimeAdapter] WebSocket test timed out — falling back to polling');
      resolve(false);
    }, 5000);

    let ws;
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      clearTimeout(timeout);
      _wsAvailable = false;
      console.warn('[realtimeAdapter] WebSocket constructor blocked — falling back to polling');
      resolve(false);
      return;
    }

    ws.onopen = () => {
      clearTimeout(timeout);
      _wsAvailable = true;
      ws.close();
      resolve(true);
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      _wsAvailable = false;
      console.warn('[realtimeAdapter] WebSocket blocked — falling back to polling');
      resolve(false);
    };
  });

  _wsTestPromise.finally(() => { _wsTestPromise = null; });
  return _wsTestPromise;
}

/**
 * Subscribe to realtime updates, falling back to polling if WS is blocked.
 *
 * @param {string} storeName - Unique key for this subscription (e.g. 'messages', 'notifications')
 * @param {Function} subscribeFn - The store's subscribeRealtime function
 * @param {Function} pollFn - Function to call for polling updates
 * @param {number} [interval=30000] - Polling interval in ms
 */
export async function subscribeWithFallback(storeName, subscribeFn, pollFn, interval = 30000) {
  if (process.env.NEXT_PUBLIC_BRAVE_POLLING === 'false') {
    subscribeFn();
    return;
  }

  const wsOk = await testWebSocketAvailability();

  if (wsOk) {
    subscribeFn();
    return;
  }

  // WebSocket unavailable — use polling
  try { track('brave_polling_fallback', { store: storeName }); } catch {}
  // Clear any existing interval first
  unsubscribeWithFallback(storeName);

  // Immediate first poll
  try { pollFn(); } catch {}

  const id = setInterval(() => {
    try { pollFn(); } catch (e) {
      console.warn(`[realtimeAdapter] polling error for ${storeName}:`, e);
    }
  }, interval);

  _pollingIntervals.set(storeName, id);
}

/**
 * Unsubscribe — clears polling interval if active, or calls unsubscribe if using WS.
 */
export function unsubscribeWithFallback(storeName, unsubscribeFn) {
  const intervalId = _pollingIntervals.get(storeName);
  if (intervalId) {
    clearInterval(intervalId);
    _pollingIntervals.delete(storeName);
  }
  if (unsubscribeFn) {
    unsubscribeFn();
  }
}

/**
 * Check if we're currently in polling mode.
 */
export function isPollingMode() {
  return _wsAvailable === false;
}

/**
 * Reset the WS availability test (for testing or retry).
 */
export function resetWsTest() {
  _wsAvailable = null;
  _wsTestPromise = null;
}
