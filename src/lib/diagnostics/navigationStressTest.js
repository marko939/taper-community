'use client';

import { createClient } from '@/lib/supabase/client';
import { useForumStore } from '@/stores/forumStore';
import { useThreadStore } from '@/stores/threadStore';
import { useProfileStore } from '@/stores/profileStore';

export function initNavigationStressTest() {
  window.__taperDiag = window.__taperDiag || {};

  /**
   * Navigate through a sequence of routes and measure stability metrics.
   * Usage: window.__taperDiag.navStress()
   * Or with custom routes: window.__taperDiag.navStress(['/forums', '/profile/abc', ...])
   */
  window.__taperDiag.navStress = async (customRoutes) => {
    const routes = customRoutes || [
      '/',
      '/forums',
      '/forums/sertraline',
      '/forums',
      '/forums/escitalopram',
      '/',
    ];

    console.log(`[TaperDiag] Starting navigation stress test (${routes.length} routes)...`);

    const supabase = createClient();
    const baselineHeap = performance.memory?.usedJSHeapSize ?? 0;
    const baselineChannels = supabase.getChannels?.()?.length ?? 0;
    const results = [];

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];

      // Navigate
      window.history.pushState({}, '', route);
      window.dispatchEvent(new PopStateEvent('popstate'));

      // Wait for route to settle
      await new Promise((r) => setTimeout(r, 2000));

      const channels = supabase.getChannels?.()?.length ?? 0;
      const heap = performance.memory?.usedJSHeapSize ?? 0;
      const heapMB = (heap / 1048576).toFixed(1);
      const forumSnap = useForumStore.getState().getSnapshot();
      const threadSnap = useThreadStore.getState().getSnapshot();
      const profileSnap = useProfileStore.getState().getSnapshot();

      results.push({
        step: i + 1,
        route,
        channels,
        heapMB,
        forumPages: forumSnap.forumPages,
        threadsCached: threadSnap.threadKeys,
        profilesCached: profileSnap.profileKeys,
        pendingAborts: forumSnap.pendingAborts + threadSnap.pendingAborts + profileSnap.pendingAborts,
      });

      console.log(`[TaperDiag] Step ${i + 1}: ${route} | Channels: ${channels} | Heap: ${heapMB}MB | Aborts: ${results[i].pendingAborts}`);
    }

    const finalHeap = performance.memory?.usedJSHeapSize ?? 0;
    const heapGrowth = ((finalHeap - baselineHeap) / 1048576).toFixed(1);
    const finalChannels = supabase.getChannels?.()?.length ?? 0;
    const channelDelta = finalChannels - baselineChannels;

    const heapOk = parseFloat(heapGrowth) < 10;
    const channelsOk = channelDelta <= 2;

    console.log(`\n[TaperDiag] Navigation Stress Test ${heapOk && channelsOk ? 'PASSED' : 'FAILED'}`);
    console.log(`  Heap growth: ${heapGrowth}MB (limit: <10MB) — ${heapOk ? 'OK' : 'FAIL'}`);
    console.log(`  Channel delta: ${channelDelta} (limit: ≤2) — ${channelsOk ? 'OK' : 'FAIL'}`);
    console.table(results);

    return { heapGrowth, channelDelta, heapOk, channelsOk, results };
  };
}
