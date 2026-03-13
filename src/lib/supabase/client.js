'use client';

import { createBrowserClient } from '@supabase/ssr';

let _client = null;

/**
 * Fetch wrapper with a per-request timeout.
 * Prevents any single network request (especially GoTrue token refresh)
 * from hanging indefinitely and blocking the internal auth lock queue.
 */
const FETCH_TIMEOUT_MS = 15_000; // 15 seconds

function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  if (options?.signal) {
    options.signal.addEventListener('abort', () => controller.abort(options.signal.reason));
  }
  const timer = setTimeout(() => controller.abort(new Error('Request timed out')), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

/**
 * Simple in-memory mutex with timeout for GoTrue auth lock.
 *
 * Why not the no-op bypass (`async (_, __, fn) => await fn()`)?
 * → Supabase refresh tokens are single-use. Without serialization,
 *   concurrent requests all detect an expired token, all call refreshSession(),
 *   the first one consumes the refresh token, and the rest fail — corrupting
 *   the session and requiring a page refresh.
 *
 * Why not the default Navigator LockManager?
 * → If a lock holder hangs (slow network, tab throttled), every queued
 *   operation waits forever. One hung refresh freezes ALL Supabase calls.
 *
 * This mutex serializes auth ops with a hard 10s timeout per holder.
 * If the holder takes too long, the next waiter proceeds anyway — a rare
 * double refresh is better than a frozen app.
 */
const LOCK_TIMEOUT_MS = 10_000;
let _lockPromise = Promise.resolve();

function lockWithTimeout(_name, _acquireTimeout, fn) {
  // Chain onto the previous lock holder — ensures serial execution.
  // Each call sees the CURRENT _lockPromise at call time, then replaces
  // it with its own work so the next caller waits on us.
  let resolve;
  const prev = _lockPromise;
  _lockPromise = new Promise((r) => { resolve = r; });

  return (async () => {
    // Wait for previous holder, but give up after LOCK_TIMEOUT_MS
    try {
      await Promise.race([
        prev,
        new Promise((r) => setTimeout(r, LOCK_TIMEOUT_MS)),
      ]);
    } catch {
      // Previous holder errored — proceed anyway
    }
    try {
      return await fn();
    } finally {
      resolve();
    }
  })();
}

export function createClient() {
  if (!_client) {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/\s+/g, '');

    if (!url || !key) {
      console.error(
        `[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. ` +
        'Set them in .env.local (locally) or Vercel Environment Variables (production) BEFORE building.'
      );
      _client = createBrowserClient(
        url || 'https://placeholder.supabase.co',
        key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder'
      );
      return _client;
    }

    _client = createBrowserClient(url, key, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        // Custom mutex: serializes auth ops with a 10s timeout per holder.
        // Prevents concurrent refresh token races AND indefinite lock hangs.
        lock: lockWithTimeout,
      },
      global: {
        fetch: fetchWithTimeout,
      },
    });
  }
  return _client;
}
