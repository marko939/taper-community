let _navigating = false;
let _timer = null;

export function acquireNavigationLock() {
  if (process.env.NEXT_PUBLIC_NAV_LOCK === 'false') return true;
  if (_navigating) return false;
  _navigating = true;
  // Safety auto-release after 1.5s — prevents permanent lock from edge cases
  _timer = setTimeout(() => {
    _navigating = false;
  }, 1500);
  return true;
}

export function releaseNavigationLock() {
  _navigating = false;
  if (_timer) {
    clearTimeout(_timer);
    _timer = null;
  }
}

export function isNavigating() {
  return _navigating;
}
