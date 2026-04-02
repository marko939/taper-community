/**
 * Safe wrappers around localStorage and sessionStorage.
 * Prevents crashes in Safari private browsing, Brave shields,
 * and any environment where storage throws on access.
 */

function makeStorage(backend) {
  return {
    get(key) {
      try { return backend.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { backend.setItem(key, value); } catch { /* silent */ }
    },
    remove(key) {
      try { backend.removeItem(key); } catch { /* silent */ }
    },
  };
}

// Guard: in SSR or when storage is entirely unavailable, use no-ops
const noopStorage = { get: () => null, set: () => {}, remove: () => {} };

export const safeLocal =
  typeof window !== 'undefined' && typeof localStorage !== 'undefined'
    ? makeStorage(localStorage)
    : noopStorage;

export const safeSession =
  typeof window !== 'undefined' && typeof sessionStorage !== 'undefined'
    ? makeStorage(sessionStorage)
    : noopStorage;
