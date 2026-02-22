'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const THREADS_PER_PAGE = 20;

export function useForumData() {
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchForums = async () => {
      const { data } = await supabase
        .from('forums')
        .select('*')
        .order('category')
        .order('name');
      setForums(data || []);
      setLoading(false);
    };
    fetchForums();
  }, []);

  const drugForums = forums.filter((f) => f.category === 'drug');
  const generalForums = forums.filter((f) =>
    f.category === 'general' || f.category === 'community' ||
    f.category === 'start' || f.category === 'tapering' ||
    f.category === 'lifestyle'
  );
  const resourceForums = forums.filter((f) =>
    f.category === 'resources' || f.category === 'research'
  );

  return { forums, drugForums, generalForums, resourceForums, loading };
}

export function useForumThreads(forumId) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const supabase = createClient();

  const fetchPage = useCallback(async (pageNum) => {
    if (!forumId) return;
    const from = pageNum * THREADS_PER_PAGE;
    const to = from + THREADS_PER_PAGE - 1;

    const { data, count } = await supabase
      .from('threads')
      .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, drug_signature)', { count: 'exact' })
      .eq('forum_id', forumId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    const rows = data || [];
    const total = count ?? rows.length;

    if (pageNum === 0) {
      setThreads(rows);
    } else {
      setThreads((prev) => [...prev, ...rows]);
    }
    setTotalCount(total);
    setHasMore(from + rows.length < total);
    setLoading(false);
  }, [forumId]);

  useEffect(() => {
    if (!forumId) return;
    setPage(0);
    setThreads([]);
    setLoading(true);
    fetchPage(0);
  }, [forumId, fetchPage]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage);
  }, [page, fetchPage]);

  return { threads, loading, hasMore, totalCount, loadMore };
}

export function useRecentThreads(limit = 10) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRecent = async () => {
      const { data } = await supabase
        .from('threads')
        .select('*, profiles:user_id(display_name, is_peer_advisor), forums:forum_id(name, drug_slug, slug)')
        .order('created_at', { ascending: false })
        .limit(limit);
      setThreads(data || []);
      setLoading(false);
    };
    fetchRecent();
  }, [limit]);

  return { threads, loading };
}

export function useThreadSearch(forumId = null) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const supabase = createClient();

  const search = useCallback(async (q) => {
    setQuery(q);
    if (!q || q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let qb = supabase
      .from('threads')
      .select('*, profiles:user_id(display_name, is_peer_advisor), forums:forum_id(name, slug, drug_slug)')
      .textSearch('title', q)
      .order('created_at', { ascending: false })
      .limit(20);

    if (forumId) {
      qb = qb.eq('forum_id', forumId);
    }

    const { data } = await qb;
    setResults(data || []);
    setLoading(false);
  }, [forumId]);

  return { results, loading, query, search };
}
