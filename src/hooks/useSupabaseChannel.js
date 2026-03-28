'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook that wraps Supabase realtime channel creation with guaranteed cleanup.
 * Prevents duplicate channels and ensures removeChannel on unmount.
 *
 * @param {string|null} channelName - Unique channel name (null to skip)
 * @param {object} config - postgres_changes config: { event, schema, table, filter }
 * @param {function} onEvent - Callback for realtime events
 */
export function useSupabaseChannel(channelName, config, onEvent) {
  const channelRef = useRef(null);

  useEffect(() => {
    if (!channelName) return;

    const supabase = createClient();

    // Remove existing channel with same name to prevent duplicates
    const existing = supabase.getChannels().find((c) => c.topic === `realtime:${channelName}`);
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', config, onEvent)
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [channelName]); // eslint-disable-line react-hooks/exhaustive-deps
}
