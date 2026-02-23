'use client';

import { createBrowserClient } from '@supabase/ssr';

let _client = null;
let _cookiesCleared = false;

/**
 * Nuke all sb-* auth cookies directly via document.cookie.
 * This is synchronous — no network call, no race condition.
 * Needed because corrupted cookies from failed auth attempts
 * cause "Failed to execute fetch: Invalid value" on every request.
 */
function clearSupabaseCookies() {
  if (_cookiesCleared || typeof document === 'undefined') return;
  _cookiesCleared = true;

  const cookies = document.cookie.split(';');
  let cleared = 0;
  for (const cookie of cookies) {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('sb-')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      cleared++;
    }
  }
  if (cleared > 0) {
    console.log(`[supabase] Cleared ${cleared} stale auth cookie(s)`);
  }
}

export function createClient() {
  if (!_client) {
    // Clear any corrupted cookies BEFORE creating the client
    clearSupabaseCookies();

    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/\s+/g, '');

    console.log(
      '[supabase] createClient —',
      'URL:', url ? url.substring(0, 30) + '...' : 'UNDEFINED',
      'KEY:', key ? key.substring(0, 20) + '...' : 'UNDEFINED'
    );

    if (!url || !key) {
      console.error(
        `[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. ` +
        'Set them in .env.local (locally) or Vercel Environment Variables (production) BEFORE building.'
      );
      // Return a dummy client so the app doesn't crash — features that need Supabase will silently fail
      _client = createBrowserClient(
        url || 'https://placeholder.supabase.co',
        key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder'
      );
      return _client;
    }

    _client = createBrowserClient(url, key);
  }
  return _client;
}
