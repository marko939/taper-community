'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useThreadStore } from '@/stores/threadStore';
import { GENERAL_FORUMS } from '@/lib/forumCategories';
import ThreadView from '@/components/thread/ThreadView';
import ReplyList from '@/components/thread/ReplyList';
import ReplyForm from '@/components/thread/ReplyForm';
import DeprescriberCTA from '@/components/layout/DeprescriberCTA';
import QuoteToolbar from '@/components/thread/QuoteToolbar';
import ImageLightbox from '@/components/shared/ImageLightbox';
import { PageLoading } from '@/components/shared/LoadingSpinner';

export default function ThreadPage() {
  const { threadId } = useParams();
  const thread = useThreadStore((s) => s.threads[threadId]);
  const replyData = useThreadStore((s) => s.replies[threadId]);
  const fetchThread = useThreadStore((s) => s.fetchThread);
  const fetchReplies = useThreadStore((s) => s.fetchReplies);
  const loadMoreReplies = useThreadStore((s) => s.loadMoreReplies);

  const replies = replyData?.items || [];
  const hasMoreReplies = replyData?.hasMore || false;
  const totalReplies = replyData?.totalCount || 0;
  const loading = !thread && !replyData;

  useEffect(() => {
    if (threadId) {
      fetchThread(threadId);
      fetchReplies(threadId);
    }
  }, [threadId, fetchThread, fetchReplies]);

  // Scroll to specific reply when URL has a hash (e.g. from notification click)
  useEffect(() => {
    if (!replies.length) return;
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-flash');
        setTimeout(() => el.classList.remove('highlight-flash'), 2000);
      }
    }
  }, [replies.length]);

  if (loading) return <PageLoading />;

  if (!thread) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Thread not found</h1>
        <Link href="/forums" className="mt-4 inline-block font-medium text-accent-blue hover:underline">Back to Forums</Link>
      </div>
    );
  }

  const primaryForum = thread.thread_forums?.[0]?.forums || thread.forums;
  const forumSlug = primaryForum?.drug_slug || primaryForum?.slug;
  const forumDisplayName = primaryForum
    ? (GENERAL_FORUMS.find((gf) => gf.slug === primaryForum.slug)?.name || primaryForum.name)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5 text-sm text-text-subtle">
        <Link href="/forums" className="hover:text-foreground">Forums</Link>
        {forumSlug && forumDisplayName && (
          <>
            <span>/</span>
            <Link href={`/forums/${forumSlug}`} className="hover:text-foreground">{forumDisplayName}</Link>
          </>
        )}
      </div>

      <ThreadView thread={thread} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        <ReplyList
          replies={replies}
          threadId={threadId}
          hasMore={hasMoreReplies}
          totalCount={totalReplies}
          onLoadMore={() => loadMoreReplies(threadId)}
        />
        <ReplyForm threadId={threadId} />
      </div>

      <QuoteToolbar />
      <ImageLightbox />
      <DeprescriberCTA className="mt-8" />
    </div>
  );
}
