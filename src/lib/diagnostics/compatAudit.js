/**
 * Cross-Browser Compatibility Audit
 *
 * Runs once on app load (when NEXT_PUBLIC_DIAG_MODE=true).
 * Checks browser APIs used by the app and logs PASS/WARN/FAIL for each.
 */

function check(name, test) {
  try {
    const result = test();
    if (result === 'warn') {
      console.warn(`[COMPAT WARN] ${name}`);
      return { name, status: 'WARN' };
    }
    if (result) {
      console.log(`[COMPAT PASS] ${name}`);
      return { name, status: 'PASS' };
    }
    console.error(`[COMPAT FAIL] ${name}`);
    return { name, status: 'FAIL' };
  } catch (e) {
    console.error(`[COMPAT FAIL] ${name}:`, e.message);
    return { name, status: 'FAIL', error: e.message };
  }
}

export function runCompatAudit() {
  if (typeof window === 'undefined') return [];

  const results = [];

  // Hard requirements (FAIL if missing)
  results.push(check('WebSocket', () => typeof WebSocket !== 'undefined'));
  results.push(check('AbortController', () => typeof AbortController !== 'undefined'));
  results.push(check('fetch', () => typeof fetch === 'function'));
  results.push(check('Promise', () => typeof Promise !== 'undefined'));
  results.push(check('IntersectionObserver', () => typeof IntersectionObserver !== 'undefined'));
  results.push(check('ResizeObserver', () => typeof ResizeObserver !== 'undefined'));

  // Soft requirements (WARN if missing — app has fallbacks)
  results.push(check('requestIdleCallback', () =>
    'requestIdleCallback' in window ? true : 'warn'
  ));
  results.push(check('crypto.randomUUID', () =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? true : 'warn'
  ));
  results.push(check('navigator.sendBeacon', () =>
    typeof navigator.sendBeacon === 'function' ? true : 'warn'
  ));
  results.push(check('performance.memory', () =>
    performance.memory ? true : 'warn'
  ));

  // Storage availability
  results.push(check('localStorage', () => {
    const key = '__compat_test__';
    localStorage.setItem(key, '1');
    const val = localStorage.getItem(key);
    localStorage.removeItem(key);
    return val === '1';
  }));
  results.push(check('sessionStorage', () => {
    const key = '__compat_test__';
    sessionStorage.setItem(key, '1');
    const val = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    return val === '1';
  }));

  // Browser detection
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';

  // Brave detection
  let isBrave = false;
  try {
    if (navigator.brave && typeof navigator.brave.isBrave === 'function') {
      navigator.brave.isBrave().then((val) => {
        if (val) console.log('[COMPAT INFO] Browser: Brave');
      });
      isBrave = true;
    }
  } catch {}

  console.log(`[COMPAT INFO] Browser: ${browser} (Brave: ${isBrave ? 'likely' : 'no'})`);
  console.log(`[COMPAT INFO] UA: ${ua}`);

  // Summary
  const fails = results.filter((r) => r.status === 'FAIL');
  const warns = results.filter((r) => r.status === 'WARN');
  console.log(`[COMPAT SUMMARY] ${results.length} checks: ${fails.length} FAIL, ${warns.length} WARN, ${results.length - fails.length - warns.length} PASS`);

  // Expose for manual inspection
  if (typeof window !== 'undefined') {
    window.__taperDiag = window.__taperDiag || {};
    window.__taperDiag.compat = () => results;
  }

  return results;
}
