'use client';

import { createBrowserClient } from '@supabase/ssr';

let _client = null;

// In-memory lock to replace Navigator LockManager.
// Serializes auth operations with timeouts on both acquiring the lock
// AND executing the operation, so nothing can permanently block requests.
let _lockChain = Promise.resolve();
async function inMemoryLock(_name, acquireTimeout, fn) {
  const previous = _lockChain;
  let releaseLock;
  _lockChain = new Promise((resolve) => { releaseLock = resolve; });

  const timeout = acquireTimeout > 0 ? acquireTimeout : 5000;

  // Wait for previous operation, give up after timeout
  await Promise.race([
    previous,
    new Promise((resolve) => setTimeout(resolve, timeout)),
  ]);

  let timer;
  try {
    // Run auth operation with timeout — if token refresh hangs, give up
    // rather than blocking all subsequent requests forever
    return await Promise.race([
      fn(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('lock_timeout')), timeout);
      }),
    ]);
  } catch (err) {
    // Swallow lock timeout so supabase-js doesn't crash — the next
    // request will retry with whatever token is currently stored
    if (err?.message === 'lock_timeout') return null;
    throw err;
  } finally {
    clearTimeout(timer);
    releaseLock();
  }
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
        // In-memory mutex replaces Navigator LockManager to prevent both
        // stale lock timeouts AND concurrent token refresh race conditions
        lock: inMemoryLock,
      },
    });
  }
  return _client;
}
