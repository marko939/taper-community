'use client';

import { createClient } from '@/lib/supabase/client';

/**
 * Wraps a Supabase fetch operation with automatic auth-refresh retry.
 *
 * When the tab sits in background, the JWT expires. The first fetch after
 * returning will fail (RLS blocks it or returns empty). This wrapper:
 * 1. Tries the fetch
 * 2. If it fails or returns no data, refreshes the auth token
 * 3. Retries the fetch once with the fresh token
 *
 * Usage in a store:
 *   const data = await fetchWithRetry(() => supabase.from('x').select('*'));
 *
 * @param {Function} fn - async function that performs the Supabase query.
 *   Must return { data, error } (standard Supabase response shape).
 * @param {Object} options
 * @param {AbortSignal} options.signal - optional abort signal
 * @returns {Promise<{data: any, error: any}>}
 */
export async function fetchWithRetry(fn, { signal } = {}) {
  // First attempt
  let result = await fn();

  // If aborted, return immediately
  if (signal?.aborted) return result;

  // Check if we got a usable result
  const failed = result.error || !result.data ||
    (Array.isArray(result.data) && result.data.length === 0);

  if (failed) {
    // Refresh auth token and retry once
    try {
      const supabase = createClient();
      await supabase.auth.getSession();
    } catch (e) {
      // Auth refresh failed — return original result
      return result;
    }

    if (signal?.aborted) return result;

    // Retry with fresh token
    result = await fn();
  }

  return result;
}
