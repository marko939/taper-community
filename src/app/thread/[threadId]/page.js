'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useThreadStore } from '@/stores/threadStore';
import { useAuthStore } from '@/stores/authStore';
import { useFollowStore } from '@/stores/followStore';
import { authReady } from '@/lib/visibilityManager';
import { GENERAL_FORUMS } from '@/lib/forumCategories';
import ThreadView from '@/components/thread/ThreadView';
import ReplyList from '@/components/thread/ReplyList';
import ReplyForm from '@/components/thread/ReplyForm';
import DeprescriberCTA from '@/components/layout/DeprescriberCTA';
import QuoteToolbar from '@/components/thread/QuoteToolbar';
import ImageLightbox from '@/components/shared/ImageLightbox';
import { PageLoading } from '@/components/shared/LoadingSpinner';
import { useRouteCleanup } from '@/hooks/useRouteCleanup';

export default function ThreadPage() {
  useRouteCleanup();
  const { threadId } = useParams();
  const thread = useThreadStore((s) => s.threads[threadId]);
  const replyData = useThreadStore((s) => s.replies[threadId]);
  const fetchThread = useThreadStore((s) => s.fetchThread);
  const fetchReplies = useThreadStore((s) => s.fetchReplies);
  const loadMoreReplies = useThreadStore((s) => s.loadMoreReplies);
  const fetchReplyPage = useThreadStore((s) => s.fetchReplyPage);
  const user = useAuthStore((s) => s.user);
  const fetchThreadFollows = useFollowStore((s) => s.fetchThreadFollows);

  const replies = replyData?.items || [];
  const hasMoreReplies = replyData?.hasMore || false;
  const totalReplies = replyData?.totalCount || 0;
  const loading = !thread && !replyData;

  // Load thread — wait for auth to be fresh first (handles stale tab → click thread)
  useEffect(() => {
    if (!threadId) return;
    let cancelled = false;
    authReady().then(() => { if (!cancelled) fetchThread(threadId); });
    return () => { cancelled = true; };
  }, [threadId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load replies only after thread data exists (waterfall)
  useEffect(() => {
    if (!threadId || !thread) return;

    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const replyId = hash.startsWith('#reply-') ? hash.replace('#reply-', '') : null;

    if (replyId) {
      fetchReplyPage(threadId, replyId);
    } else {
      fetchReplies(threadId);
    }
  }, [threadId, !!thread]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load follows last (lowest priority)
  useEffect(() => {
    if (user?.id && thread) fetchThreadFollows(user.id);
  }, [user?.id, !!thread]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch thread when tab becomes visible (stale tab recovery)
  useEffect(() => {
    if (!threadId) return;
    const handler = () => {
      if (!document.hidden) {
        useThreadStore.getState().fetchThread(threadId);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [threadId]);

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
          {totalReplies} {totalReplies === 1 ? 'Reply' : 'Replies'}
        </h2>
        <ReplyList
          replies={replies}
          threadId={threadId}
          hasMore={hasMoreReplies}
          totalCount={totalReplies}
          onLoadMore={() => loadMoreReplies(threadId)}
        />
        {user ? (
          <ReplyForm threadId={threadId} />
        ) : (
          <div
            className="rounded-2xl border p-6 text-center"
            style={{ borderColor: 'var(--border-subtle)', background: 'linear-gradient(135deg, var(--purple-ghost) 0%, var(--surface-strong) 100%)' }}
          >
            <h3 className="text-base font-semibold text-foreground">Join the conversation</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">
              Sign in to share your experience and connect with others.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link href="/auth/signin" className="btn btn-primary text-sm no-underline">Sign In</Link>
              <Link href="/auth/signup" className="btn btn-secondary text-sm no-underline">Create Free Account</Link>
            </div>
          </div>
        )}
      </div>

      {user && <QuoteToolbar />}
      <ImageLightbox />
      <DeprescriberCTA className="mt-8" />
    </div>
  );
}
