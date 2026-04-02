/**
 * Session Health Check — detects silent auth death from Safari ITP.
 *
 * Safari ITP can delete localStorage-stored auth tokens. The user appears
 * logged in (React state) but every Supabase query fails with auth errors.
 * This check runs on tab visibility restore and dispatches a custom event
 * so the UI can show a re-login prompt instead of silently freezing.
 */

import { track } from '@vercel/analytics';

/**
 * Validate a Supabase session. Dispatches 'taper:session-expired' if invalid.
 * @param {object|null} session - The session from supabase.auth.getSession()
 * @param {boolean} wasAuthenticated - Whether the user was logged in before tab hide
 * @returns {boolean} true if session is healthy
 */
export function checkSessionHealth(session, wasAuthenticated) {
  // If user was never authenticated, nothing to check
  if (!wasAuthenticated) return true;

  // Session missing entirely — ITP may have cleared storage
  if (!session?.user) {
    console.warn('[sessionHealth] Session lost — possible ITP deletion');
    try { track('session_expired', { reason: 'missing' }); } catch {}
    window.dispatchEvent(new CustomEvent('taper:session-expired'));
    return false;
  }

  // Session expired
  const expiresAt = session.expires_at;
  if (expiresAt && expiresAt * 1000 < Date.now()) {
    console.warn('[sessionHealth] Session expired');
    try { track('session_expired', { reason: 'expired' }); } catch {}
    window.dispatchEvent(new CustomEvent('taper:session-expired'));
    return false;
  }

  return true;
}
