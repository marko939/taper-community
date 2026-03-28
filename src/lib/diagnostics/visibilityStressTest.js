'use client';

import { createClient } from '@/lib/supabase/client';

export function initVisibilityStressTest() {
  window.__taperDiag = window.__taperDiag || {};

  window.__taperDiag.visibilityStress = async () => {
    console.log('[TaperDiag] Starting visibility stress test (5 cycles)...');

    const supabase = createClient();
    const baselineChannels = supabase.getChannels?.()?.length ?? 0;
    const baselineHeap = performance.memory?.usedJSHeapSize ?? 0;
    const results = [];

    for (let i = 0; i < 5; i++) {
      // Simulate hidden
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));

      await new Promise((r) => setTimeout(r, 200));

      // Simulate visible
      Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));

      await new Promise((r) => setTimeout(r, 500));

      // Check responsiveness with a lightweight query
      let pass = false;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        await supabase
          .from('forums')
          .select('id')
          .limit(1)
          .abortSignal(controller.signal);
        clearTimeout(timeout);
        pass = true;
      } catch (err) {
        pass = err.name !== 'AbortError' ? false : false;
      }

      const channels = supabase.getChannels?.()?.length ?? 0;
      const heap = performance.memory?.usedJSHeapSize ?? 0;
      results.push({ cycle: i + 1, pass, channels, heapMB: (heap / 1048576).toFixed(1) });
      console.log(`[TaperDiag] Cycle ${i + 1}: ${pass ? 'PASS' : 'FAIL'} | Channels: ${channels} | Heap: ${(heap / 1048576).toFixed(1)}MB`);
    }

    const finalChannels = supabase.getChannels?.()?.length ?? 0;
    const finalHeap = performance.memory?.usedJSHeapSize ?? 0;
    const channelDelta = finalChannels - baselineChannels;
    const heapDelta = ((finalHeap - baselineHeap) / 1048576).toFixed(1);
    const allPassed = results.every((r) => r.pass);

    console.log(`\n[TaperDiag] Visibility Stress Test ${allPassed ? 'PASSED' : 'FAILED'}`);
    console.log(`  Channel delta: ${channelDelta} | Heap delta: ${heapDelta}MB`);
    console.table(results);

    return { allPassed, channelDelta, heapDelta, results };
  };
}
