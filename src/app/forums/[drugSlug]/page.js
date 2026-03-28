'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { waitForAuth } from '@/lib/visibilityManager';
import { useForumStore } from '@/stores/forumStore';
import { getDrug } from '@/lib/drugs';
import Badge from '@/components/shared/Badge';
import ThreadList from '@/components/forums/ThreadList';
import SearchBar from '@/components/shared/SearchBar';
import { PageLoading } from '@/components/shared/LoadingSpinner';
import ForumFollowButton from '@/components/shared/ForumFollowButton';
import { useRouteCleanup } from '@/hooks/useRouteCleanup';

export default function ForumPage() {
  useRouteCleanup();
  const { drugSlug } = useParams();
  const [forum, setForum] = useState(null);
  const [forumLoading, setForumLoading] = useState(true);
  const drug = getDrug(drugSlug);

  const threadData = useForumStore((s) => s.threadPages[forum?.id]);
  const searchState = useForumStore((s) => s.searchState[forum?.id]);
  const fetchThreads = useForumStore((s) => s.fetchThreads);
  const loadMoreThreads = useForumStore((s) => s.loadMoreThreads);
  const searchFn = useForumStore((s) => s.search);

  useEffect(() => {
    setForumLoading(true);
    const controller = new AbortController();
    const fetchForum = async () => {
      await waitForAuth(); // ensure JWT is fresh after stale tab
      const supabase = createClient();
      let { data } = await supabase
        .from('forums')
        .select('*')
        .eq('drug_slug', drugSlug)
        .abortSignal(controller.signal)
        .maybeSingle();

      if (!data && !controller.signal.aborted) {
        const result = await supabase
          .from('forums')
          .select('*')
          .eq('slug', drugSlug)
          .abortSignal(controller.signal)
          .maybeSingle();
        data = result.data;
      }

      if (!controller.signal.aborted) {
        setForum(data);
        setForumLoading(false);
      }
    };
    fetchForum().catch((err) => {
      if (err.name !== 'AbortError') console.error('[ForumPage] fetchForum error:', err);
    });
    return () => controller.abort();
  }, [drugSlug]);

  const [blogPosts, setBlogPosts] = useState([]);

  // Re-fetch threads when forum loads, AND when threadData is cleared by invalidate()
  // (e.g. tab comes back from background). Without the threadData dep, the effect
  // wouldn't re-run because forum.id hasn't changed.
  const hasThreadData = !!threadData;
  useEffect(() => {
    if (forum?.id && !hasThreadData) {
      fetchThreads(forum.id);
    }
  }, [forum?.id, hasThreadData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch blog posts assigned to this forum
  useEffect(() => {
    if (!forum) return;
    const forumSlug = forum.drug_slug || forum.slug;
    if (!forumSlug) return;
    const controller = new AbortController();
    const supabase = createClient();
    supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, tags, cover_image_url, created_at, author_id, comment_count, forum_slugs')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .abortSignal(controller.signal)
      .then(({ data }) => {
        if (controller.signal.aborted || !data) return;
        // Filter client-side for posts assigned to this forum
        const matched = data.filter((p) => p.forum_slugs && p.forum_slugs.includes(forumSlug));
        // Shape blog posts to look like threads for ThreadCard
        setBlogPosts(matched.map((p) => ({
          id: p.id,
          title: p.title,
          body: p.excerpt || '',
          tags: p.tags || [],
          reply_count: p.comment_count || 0,
          view_count: 0,
          vote_score: 0,
          pinned: false,
          created_at: p.created_at,
          user_id: p.author_id,
          blog_post_slug: p.slug,
          profiles: { display_name: 'Based Psychiatrist', avatar_url: 'https://aygtqzhccqmglkvtvish.supabase.co/storage/v1/object/public/avatars/8572637a-2109-4471-bcb4-3163d04094d0/avatar.jpg', is_peer_advisor: false, is_founding_member: false },
        })));
      });
    return () => controller.abort();
  }, [forum]);

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

  const threads = threadData?.items ?? [];
  const threadsLoading = !threadData || threadData?.loading;
  const hasMore = threadData?.hasMore || false;
  const totalCount = threadData?.totalCount || 0;

  const searchResults = searchState?.results || [];
  const searchLoading = searchState?.loading || false;
  const searchQuery = searchState?.query || '';
  const isSearching = searchQuery && searchQuery.trim().length >= 2;

  const handleSearch = (q) => searchFn(forum.id, q);

  // Merge blog posts into thread list, sorted by created_at
  const allItems = isSearching ? searchResults : [...threads, ...blogPosts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const pinnedThreads = isSearching ? [] : allItems.filter((t) => t.pinned);
  const regularThreads = isSearching ? allItems : allItems.filter((t) => !t.pinned);

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
              <ForumFollowButton forumId={forum.id} />
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
      <SearchBar onSearch={handleSearch} placeholder={`Search threads in ${forum.name}...`} />

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
