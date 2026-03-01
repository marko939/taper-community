'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useForumStore } from '@/stores/forumStore';
import { getDrug } from '@/lib/drugs';
import Badge from '@/components/shared/Badge';
import ThreadList from '@/components/forums/ThreadList';
import SearchBar from '@/components/shared/SearchBar';
import { PageLoading } from '@/components/shared/LoadingSpinner';

export default function ForumPage() {
  const { drugSlug } = useParams();
  const [forum, setForum] = useState(null);
  const [forumLoading, setForumLoading] = useState(true);
  const supabase = createClient();
  const drug = getDrug(drugSlug);

  const threadData = useForumStore((s) => s.threadPages[forum?.id]);
  const searchState = useForumStore((s) => s.searchState[forum?.id]);
  const fetchThreads = useForumStore((s) => s.fetchThreads);
  const loadMoreThreads = useForumStore((s) => s.loadMoreThreads);
  const searchFn = useForumStore((s) => s.search);

  useEffect(() => {
    let cancelled = false;
    const fetchForum = async () => {
      let { data } = await supabase
        .from('forums')
        .select('*')
        .eq('drug_slug', drugSlug)
        .maybeSingle();

      if (!data) {
        const result = await supabase
          .from('forums')
          .select('*')
          .eq('slug', drugSlug)
          .maybeSingle();
        data = result.data;
      }

      if (!cancelled) {
        setForum(data);
        setForumLoading(false);
      }
    };
    fetchForum();
    return () => { cancelled = true; };
  }, [drugSlug]);

  useEffect(() => {
    if (forum?.id) {
      fetchThreads(forum.id);
    }
  }, [forum?.id, fetchThreads]);

  if (forumLoading) return <PageLoading />;

  if (!forum) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">Forum not found</h1>
        <p className="mt-2 text-sm text-text-muted">This forum may not exist yet or the URL is incorrect.</p>
        <Link href="/forums" className="mt-4 inline-block font-medium text-purple hover:underline">
          Back to Forums
        </Link>
      </div>
    );
  }

  const threads = threadData?.items || [];
  const threadsLoading = threadData?.loading ?? true;
  const hasMore = threadData?.hasMore || false;
  const totalCount = threadData?.totalCount || 0;

  const searchResults = searchState?.results || [];
  const searchLoading = searchState?.loading || false;
  const searchQuery = searchState?.query || '';
  const isSearching = searchQuery && searchQuery.trim().length >= 2;

  const handleSearch = (q) => searchFn(forum.id, q);

  const displayThreads = isSearching ? searchResults : threads;
  const pinnedThreads = isSearching ? [] : displayThreads.filter((t) => t.pinned);
  const regularThreads = isSearching ? displayThreads : displayThreads.filter((t) => !t.pinned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel overflow-hidden">
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--purple), var(--purple-light))' }} />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-text-subtle">
                <Link href="/forums" className="hover:text-purple">Forums</Link>
                <span>/</span>
                <span className="text-foreground">{forum.name}</span>
              </div>
              <h1 className="font-serif text-3xl font-semibold text-foreground">{forum.name}</h1>
              {forum.description && (
                <p className="mt-2 text-sm text-text-muted">{forum.description}</p>
              )}
              {drug && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge>{drug.class}</Badge>
                  <span className="text-sm text-text-muted">Half-life: {drug.halfLife}</span>
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {drug && (
                <Link
                  href={`/drugs/${drug.slug}`}
                  className="btn btn-secondary shrink-0 text-sm no-underline"
                >
                  Drug Profile
                </Link>
              )}
              <Link
                href={`/thread/new?forum=${forum.id}`}
                className="btn btn-primary shrink-0 no-underline"
              >
                New Thread
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <SearchBar onSearch={handleSearch} placeholder={`Search in ${forum.name}...`} />

      {isSearching && (
        <p className="text-sm text-text-muted">
          {searchLoading ? 'Searching...' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`}
        </p>
      )}

      {/* Pinned Threads */}
      {pinnedThreads.length > 0 && (
        <div className="space-y-3">
          <h2 className="section-eyebrow">Pinned</h2>
          <ThreadList threads={pinnedThreads} loading={false} />
        </div>
      )}

      {/* All Threads */}
      <ThreadList
        threads={regularThreads}
        loading={threadsLoading}
        hasMore={!isSearching && hasMore}
        totalCount={totalCount}
        onLoadMore={() => loadMoreThreads(forum.id)}
      />
    </div>
  );
}
