import { createClient } from '@/lib/supabase/client';

const ENSURE_SESSION_TIMEOUT_MS = 10_000; // 10 seconds

/**
 * Ensures a valid Supabase session exists before performing a mutation.
 * If the session is expired or missing, attempts to refresh it.
 * Throws a user-friendly error if the session cannot be restored.
 *
 * Includes a hard timeout to prevent indefinite hangs when the GoTrue
 * auth lock queue is backed up or the auth server is unresponsive.
 *
 * Call this BEFORE any insert/update/delete to prevent silent RLS failures.
 */
export async function ensureSession() {
  const supabase = createClient();

  // Wrap the entire operation in a timeout to prevent indefinite hangs.
  // The GoTrue auth lock can queue operations behind a hung token refresh;
  // this timeout ensures mutations fail fast instead of spinning forever.
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error('Session check timed out. Please try again.')),
      ENSURE_SESSION_TIMEOUT_MS
    );
  });

  try {
    return await Promise.race([_doEnsureSession(supabase), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

async function _doEnsureSession(supabase) {
  // getSession() reads from memory/cookies — fast, no network call
  // GoTrue auto-refreshes internally if the cached token is expired.
  const { data: { session }, error: getErr } = await supabase.auth.getSession();

  if (getErr) {
    console.warn('[ensureSession] getSession error:', getErr.message);
  }

  if (session) {
    const expiresAt = session.expires_at; // Unix timestamp in seconds
    const now = Math.floor(Date.now() / 1000);
    if (expiresAt && expiresAt - now > 60) {
      // Token is still fresh — no action needed
      return session;
    }
    // Token expires within 60s — GoTrue's getSession() should have
    // already triggered an internal refresh. Re-read to pick it up.
    const { data: { session: refreshed } } = await supabase.auth.getSession();
    if (refreshed && refreshed.expires_at && refreshed.expires_at - now > 30) {
      return refreshed;
    }
  }

  // Session is missing or still stale — explicit refresh as last resort.
  // Only ONE caller should hit this path thanks to the mutex lock.
  const { data, error } = await supabase.auth.refreshSession();

  if (error || !data?.session) {
    throw new Error('Your session has expired. Please refresh the page and sign in again.');
  }

  return data.session;
}
