'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useForumStore } from '@/stores/forumStore';
import { useThreadStore } from '@/stores/threadStore';
import { useProfileStore } from '@/stores/profileStore';
import { useBlogStore } from '@/stores/blogStore';
import { useMessageStore } from '@/stores/messageStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useFollowStore } from '@/stores/followStore';
import { useJournalStore } from '@/stores/journalStore';
import { useAuthStore } from '@/stores/authStore';

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
    const allChannels = supabase.getChannels?.() ?? [];
    const channelStates = allChannels.map((ch) => `${ch.topic}(${ch.state})`);

    // Collect pending aborts from all stores
    const stores = {
      forum: useForumStore.getState(),
      thread: useThreadStore.getState(),
      profile: useProfileStore.getState(),
      blog: useBlogStore.getState(),
      message: useMessageStore.getState(),
      notification: useNotificationStore.getState(),
      follow: useFollowStore.getState(),
      journal: useJournalStore.getState(),
    };

    const issues = [];
    if (allChannels.length > 5) issues.push(`channels=${allChannels.length}`);

    // Check for unhealthy channels
    const unhealthy = allChannels.filter((ch) => ch.state === 'errored' || ch.state === 'closed');
    if (unhealthy.length > 0) issues.push(`deadChannels=${unhealthy.length}`);

    // Check pending aborts across all stores
    for (const [name, state] of Object.entries(stores)) {
      const aborts = Object.keys(state._abortControllers || {}).length;
      if (aborts > 0) issues.push(`${name}Aborts=${aborts}`);
    }

    // Auth session check
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session?.user) {
        const { user } = useAuthStore.getState();
        if (user) {
          issues.push('authDesync=stateHasUserButNoSession');
        }
      }
    }).catch(() => {});

    const status = issues.length === 0 ? 'CLEAN' : `LEAK DETECTED [${issues.join(', ')}]`;
    console.log(`[TaperDiag] ROUTE HEALTH: ${status} | ${label} | ${mountDuration}ms | channels: [${channelStates.join(', ')}]`);

    return () => {
      const unmountChannels = supabase.getChannels?.()?.length ?? 0;
      console.log(`[TaperDiag] UNMOUNT: ${label} | channels=${unmountChannels}`);
    };
  }, [pathname, routeLabel]);
}
