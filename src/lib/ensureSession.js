import { createClient } from '@/lib/supabase/client';

const ENSURE_SESSION_TIMEOUT_MS = 6_000; // 6 seconds — fail fast, let form-level timeout handle UX

/**
 * Ensures a valid Supabase session exists before performing a mutation.
 * If the session is expired or missing, attempts to refresh it.
 * Retries once on timeout before giving up.
 *
 * Call this BEFORE any insert/update/delete to prevent silent RLS failures.
 */
export async function ensureSession() {
  // Try up to 2 times — first attempt + one retry
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await _withTimeout(_doEnsureSession(), ENSURE_SESSION_TIMEOUT_MS);
    } catch (err) {
      if (attempt === 0 && err.message?.includes('timed out')) {
        console.warn('[ensureSession] First attempt timed out, retrying...');
        continue;
      }
      throw err;
    }
  }
}

function _withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error('Session check timed out. Please refresh the page and try again.')),
      ms
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function _doEnsureSession() {
  const supabase = createClient();

  // Fast path: check if we already have a valid session in memory
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const expiresAt = session.expires_at; // Unix timestamp in seconds
      const now = Math.floor(Date.now() / 1000);
      if (expiresAt && expiresAt - now > 60) {
        return session;
      }
    }
  } catch (e) {
    console.warn('[ensureSession] getSession failed:', e.message);
  }

  // Session missing or expiring soon — force refresh
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data?.session) {
      return data.session;
    }
    if (error) {
      console.warn('[ensureSession] refreshSession error:', error.message);
    }
  } catch (e) {
    console.warn('[ensureSession] refreshSession threw:', e.message);
  }

  // Last resort: try getUser which also refreshes the token internally
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return session;
    }
  } catch (e) {
    console.warn('[ensureSession] getUser fallback failed:', e.message);
  }

  throw new Error('Your session has expired. Please refresh the page and sign in again.');
}
