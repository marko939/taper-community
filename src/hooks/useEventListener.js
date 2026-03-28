'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook that safely attaches an event listener and removes it on cleanup.
 * Handler is stored in a ref so it can change without re-attaching.
 *
 * @param {EventTarget|null} target - The target to attach the listener to
 * @param {string} event - Event name
 * @param {function} handler - Event handler
 * @param {object} [options] - addEventListener options
 */
export function useEventListener(target, event, handler, options) {
  const savedHandler = useRef(handler);

  // Update ref when handler changes (avoids re-attaching listener)
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const el = target;
    if (!el?.addEventListener) return;

    const listener = (e) => savedHandler.current(e);
    el.addEventListener(event, listener, options);
    return () => el.removeEventListener(event, listener, options);
  }, [target, event]); // eslint-disable-line react-hooks/exhaustive-deps
}
