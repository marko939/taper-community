import { createClient } from '@/lib/supabase/client';

/**
 * Ensures a valid Supabase session exists before performing a mutation.
 * If the session is expired or missing, attempts to refresh it.
 * Throws a user-friendly error if the session cannot be restored.
 *
 * Call this BEFORE any insert/update/delete to prevent silent RLS failures.
 */
export async function ensureSession() {
  const supabase = createClient();

  // getSession() reads from cookies/cache — fast, no network call
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    // Check if token expires within the next 60 seconds
    const expiresAt = session.expires_at; // Unix timestamp in seconds
    const now = Math.floor(Date.now() / 1000);
    if (expiresAt && expiresAt - now > 60) {
      // Token is still fresh — no action needed
      return session;
    }
  }

  // Session is missing or about to expire — force refresh
  const { data, error } = await supabase.auth.refreshSession();

  if (error || !data?.session) {
    throw new Error('Your session has expired. Please refresh the page and sign in again.');
  }

  return data.session;
}
