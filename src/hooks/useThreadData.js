'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const REPLIES_PER_PAGE = 25;

export function useThreadData(threadId) {
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMoreReplies, setHasMoreReplies] = useState(false);
  const [replyPage, setReplyPage] = useState(0);
  const [totalReplies, setTotalReplies] = useState(0);
  const supabase = createClient();

  const fetchReplies = useCallback(async (pageNum) => {
    if (!threadId) return;
    const from = pageNum * REPLIES_PER_PAGE;
    const to = from + REPLIES_PER_PAGE - 1;

    const { data, count } = await supabase
      .from('replies')
      .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, post_count, drug_signature, location)', { count: 'exact' })
      .eq('thread_id', threadId)
      .order('created_at')
      .range(from, to);

    const rows = data || [];
    const total = count ?? rows.length;

    if (pageNum === 0) {
      setReplies(rows);
    } else {
      setReplies((prev) => [...prev, ...rows]);
    }
    setTotalReplies(total);
    setHasMoreReplies(from + rows.length < total);
  }, [threadId]);

  useEffect(() => {
    if (!threadId) return;

    const fetchThread = async () => {
      const { data: threadData } = await supabase
        .from('threads')
        .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, post_count, drug_signature, location)')
        .eq('id', threadId)
        .single();

      setThread(threadData);
      setLoading(false);

      // Increment view count
      await supabase.rpc('increment_view_count', { tid: threadId }).catch(() => {
        supabase
          .from('threads')
          .update({ view_count: (threadData?.view_count || 0) + 1 })
          .eq('id', threadId);
      });
    };

    fetchThread();
    setReplyPage(0);
    fetchReplies(0);
  }, [threadId, fetchReplies]);

  const loadMoreReplies = useCallback(() => {
    const nextPage = replyPage + 1;
    setReplyPage(nextPage);
    fetchReplies(nextPage);
  }, [replyPage, fetchReplies]);

  return { thread, replies, loading, setReplies, hasMoreReplies, totalReplies, loadMoreReplies };
}
