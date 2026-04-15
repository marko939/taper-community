'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useProfileStore } from '@/stores/profileStore';
import { useThreadStore } from '@/stores/threadStore';
import { useBlogStore } from '@/stores/blogStore';
import { useJournalStore } from '@/stores/journalStore';
import { useForumStore } from '@/stores/forumStore';
import { useMessageStore } from '@/stores/messageStore';
import { createClient } from '@/lib/supabase/client';

/**
 * Mounted once in layout.js. On every route change:
 * - Cancels in-flight fetches from the previous route
 * - Prunes accumulated store state
 * - Logs diagnostics (Phase 1B)
 */
export default function NavigationObserver() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    if (prevPathname.current === pathname) return;

    // Cancel in-flight fetches from the previous route
    useForumStore.getState().cancelAll?.();
    useMessageStore.getState().cancelAll?.();

    // Prune accumulated state in stores (pass current IDs to protect active data)
    const profileMatch = pathname.match(/^\/profile\/([^/]+)/);
    const threadMatch = pathname.match(/^\/thread\/([^/]+)/);
    useProfileStore.getState().pruneCache?.(profileMatch?.[1]);
    useThreadStore.getState().pruneCache?.(threadMatch?.[1]);
    useBlogStore.getState().pruneComments?.();
    useJournalStore.getState().pruneSharedState?.();

    // Diagnostic logging
    if (process.env.NEXT_PUBLIC_DIAG_MODE === 'true') {
      const supabase = createClient();
      const channels = supabase.getChannels?.()?.length ?? 'N/A';
      const now = Date.now();
      const delta = now - mountTime.current;
      mountTime.current = now;

      const profileSnap = useProfileStore.getState().getSnapshot?.() || {};
      const threadSnap = useThreadStore.getState().getSnapshot?.() || {};

      const leaks = [];
      if (typeof channels === 'number' && channels > 5) leaks.push(`channels=${channels}`);
      if (profileSnap.pendingAborts > 0) leaks.push(`profileAborts=${profileSnap.pendingAborts}`);
      if (threadSnap.pendingAborts > 0) leaks.push(`threadAborts=${threadSnap.pendingAborts}`);

      const status = leaks.length === 0 ? 'CLEAN' : `LEAK DETECTED [${leaks.join(', ')}]`;
      console.log(
        `[TaperDiag] HEALTH: ${status} | ${prevPathname.current} -> ${pathname} | ${delta}ms since last nav | channels=${channels} | profiles=${profileSnap.profileKeys || 0} threads=${threadSnap.threadKeys || 0}`
      );
    }

    prevPathname.current = pathname;
  }, [pathname]);

  return null;
}
