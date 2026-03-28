'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook that provides an AbortController tied to component lifecycle.
 * Each call to createController() aborts the previous one.
 * Automatically aborts on unmount.
 */
export function useSafeFetch() {
  const controllerRef = useRef(null);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const createController = useCallback(() => {
    // Abort previous if still active
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller;
  }, []);

  return { createController };
}
