'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Generate a stable session ID per browser tab (persists across navigations)
function getSessionId() {
  if (typeof window === 'undefined') return null;
  let sid = sessionStorage.getItem('pv_sid');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('pv_sid', sid);
  }
  return sid;
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef(null);

  useEffect(() => {
    // Skip duplicate fires for same path
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    // Skip admin/analytics to avoid inflating own views
    if (pathname.startsWith('/admin')) return;

    // Fire and forget — never block rendering
    const supabase = createClient();
    const sessionId = getSessionId();

    supabase
      .from('page_views')
      .insert({
        path: pathname,
        referrer: document.referrer || null,
        session_id: sessionId,
      })
      .then(({ error }) => {
        if (error) console.error('[pageview]', error.message);
      });
  }, [pathname]);

  return null;
}
