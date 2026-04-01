'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useForumStore } from '@/stores/forumStore';
import { useThreadStore } from '@/stores/threadStore';
import { useProfileStore } from '@/stores/profileStore';

/**
 * Diagnostic hook — logs route health on every transition.
 * Only active when NEXT_PUBLIC_DIAG_MODE=true.
 * Drop into any page component for debugging.
 */
export function useRouteHealthCheck(routeLabel) {
  const pathname = usePathname();
  const mountTime = useRef(Date.now());

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DIAG_MODE !== 'true') return;

    const label = routeLabel || pathname;
    const mountDuration = Date.now() - mountTime.current;

    const supabase = createClient();
    const channels = supabase.getChannels?.()?.length ?? 0;
    const forumSnap = useForumStore.getState().getSnapshot();
    const threadSnap = useThreadStore.getState().getSnapshot();
    const profileSnap = useProfileStore.getState().getSnapshot();

    const issues = [];
    if (channels > 5) issues.push(`channels=${channels}`);
    if (forumSnap.pendingAborts > 0) issues.push(`forumAborts=${forumSnap.pendingAborts}`);
    if (threadSnap.pendingAborts > 0) issues.push(`threadAborts=${threadSnap.pendingAborts}`);
    if (profileSnap.pendingAborts > 0) issues.push(`profileAborts=${profileSnap.pendingAborts}`);

    const status = issues.length === 0 ? 'CLEAN' : `LEAK DETECTED [${issues.join(', ')}]`;
    console.log(`[TaperDiag] ROUTE HEALTH: ${status} | ${label} | mounted in ${mountDuration}ms`);

    return () => {
      const unmountChannels = supabase.getChannels?.()?.length ?? 0;
      console.log(`[TaperDiag] UNMOUNT: ${label} | channels=${unmountChannels}`);
    };
  }, [pathname, routeLabel]);
}
