'use client';

import { createClient } from '@/lib/supabase/client';
import { useThreadStore } from '@/stores/threadStore';

export function initThreadLoadTest() {
  window.__taperDiag = window.__taperDiag || {};

  window.__taperDiag.threadLoadTest = async (threadIds) => {
    if (!threadIds || threadIds.length === 0) {
      // Auto-discover some thread IDs
      const supabase = createClient();
      const { data } = await supabase
        .from('threads')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(10);
      threadIds = (data || []).map((t) => t.id);
    }

    if (threadIds.length === 0) {
      console.log('[TaperDiag] No threads found to test.');
      return null;
    }

    console.log(`[TaperDiag] Starting thread load test (${threadIds.length} threads)...`);

    const baselineHeap = performance.memory?.usedJSHeapSize ?? 0;
    const results = [];

    for (let i = 0; i < threadIds.length; i++) {
      const id = threadIds[i];
      await useThreadStore.getState().fetchThread(id);
      await new Promise((r) => setTimeout(r, 500));

      const supabase = createClient();
      const heap = performance.memory?.usedJSHeapSize ?? 0;
      const channels = supabase.getChannels?.()?.length ?? 0;
      const cachedThreads = Object.keys(useThreadStore.getState().threads).length;
      const heapGrowthMB = ((heap - baselineHeap) / 1048576).toFixed(1);

      results.push({
        index: i + 1,
        threadId: id.slice(0, 8) + '...',
        cachedThreads,
        channels,
        heapGrowthMB,
      });

      console.log(
        `[TaperDiag] Thread ${i + 1}/${threadIds.length}: cached=${cachedThreads} channels=${channels} heap+=${heapGrowthMB}MB`
      );
    }

    const finalHeap = performance.memory?.usedJSHeapSize ?? 0;
    const totalGrowth = ((finalHeap - baselineHeap) / 1048576).toFixed(1);
    const leaked = parseFloat(totalGrowth) > 10;

    console.log(`\n[TaperDiag] Thread Load Test ${leaked ? 'LEAK DETECTED' : 'PASSED'}`);
    console.log(`  Total heap growth: ${totalGrowth}MB (threshold: 10MB)`);
    console.log(`  Final cached threads: ${Object.keys(useThreadStore.getState().threads).length} (max expected: 5)`);
    console.table(results);

    return { leaked, totalGrowthMB: totalGrowth, results };
  };
}
