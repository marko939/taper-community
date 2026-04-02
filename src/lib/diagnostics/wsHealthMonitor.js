/**
 * WebSocket Health Monitor
 *
 * Monitors Supabase realtime channel states at 10s intervals.
 * Detects "zombie" channels that appear subscribed but have dead WebSockets.
 * Only active when NEXT_PUBLIC_DIAG_MODE=true.
 */

import { createClient } from '@/lib/supabase/client';

let _interval = null;
let _silentDeathCount = 0;

function checkChannels() {
  const supabase = createClient();
  const channels = supabase.getChannels();

  if (channels.length === 0) return;

  for (const ch of channels) {
    const state = ch.state;
    const topic = ch.topic;

    if (state === 'errored' || state === 'closed') {
      _silentDeathCount++;
      console.error(`[wsHealth] WS SILENT DEATH: ${topic} (state: ${state}) — total deaths: ${_silentDeathCount}`);
    } else if (state === 'joining') {
      console.warn(`[wsHealth] Channel stuck joining: ${topic}`);
    }
  }
}

export function startWsHealthMonitor() {
  if (typeof window === 'undefined') return;
  if (_interval) return;

  _interval = setInterval(checkChannels, 10000);

  // Expose for manual use
  window.__taperDiag = window.__taperDiag || {};
  window.__taperDiag.wsHealth = () => {
    const supabase = createClient();
    const channels = supabase.getChannels();
    return {
      channels: channels.map((ch) => ({ topic: ch.topic, state: ch.state })),
      silentDeathCount: _silentDeathCount,
    };
  };
}

export function stopWsHealthMonitor() {
  if (_interval) {
    clearInterval(_interval);
    _interval = null;
  }
}
