'use client';

let initialized = false;

/**
 * On tab return, reload the page.
 *
 * This is the nuclear option — it replaces a complex recovery system
 * (auth refresh, channel cleanup, store refetches, event dispatch) that
 * had edge cases where a single hung network call would freeze the whole
 * app. A fast reload on a warm cache is better UX than a frozen app that
 * the user has to refresh manually.
 *
 * Tradeoff: in-progress drafts (reply text, new-thread body, journal
 * entries) are lost on tab return. Users should be warned before this
 * ships to production.
 */
export function initVisibilityManager() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      window.location.reload();
    }
  });
}
