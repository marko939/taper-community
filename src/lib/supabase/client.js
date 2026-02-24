'use client';

import { createBrowserClient } from '@supabase/ssr';

let _client = null;

// In-memory mutex to replace Navigator LockManager
// Serializes auth operations (token refresh, getSession) to prevent race conditions
let _lockChain = Promise.resolve();
async function inMemoryLock(_name, _acquireTimeout, fn) {
  const previous = _lockChain;
  let releaseLock;
  _lockChain = new Promise((resolve) => { releaseLock = resolve; });
  try {
    await previous;
    return await fn();
  } finally {
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
