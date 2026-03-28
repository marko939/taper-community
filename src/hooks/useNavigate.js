'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { acquireNavigationLock } from '@/lib/navigationLock';

/**
 * Hook that wraps router.push() with a navigation lock
 * to prevent concurrent navigations from rapid clicking.
 */
export function useNavigate() {
  const router = useRouter();

  const navigate = useCallback(
    (path, options) => {
      if (!acquireNavigationLock()) return;
      router.push(path, options);
    },
    [router]
  );

  return navigate;
}
