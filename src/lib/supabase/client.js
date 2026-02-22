'use client';

import { createBrowserClient } from '@supabase/ssr';

let _client = null;

export function createClient() {
  if (!_client) {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/\s+/g, '');

    if (!url || !key) {
      throw new Error(
        'Supabase client cannot be created: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.'
      );
    }

    _client = createBrowserClient(url, key);
  }
  return _client;
}
