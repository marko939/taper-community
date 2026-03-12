'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useThreadStore } from '@/stores/threadStore';
import { useAuthStore } from '@/stores/authStore';
import { useFollowStore } from '@/stores/followStore';
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
  const user = useAuthStore((s) => s.user);
  const fetchThreadFollows = useFollowStore((s) => s.fetchThreadFollows);

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

  useEffect(() => {
    if (user?.id) fetchThreadFollows(user.id);
  }, [user?.id, fetchThreadFollows]);

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

      {user ? (
        <>
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
            <ReplyForm threadId={threadId} />
          </div>

          <QuoteToolbar />
          <ImageLightbox />
          <DeprescriberCTA className="mt-8" />
        </>
      ) : (
        <div className="relative">
          <div className="pointer-events-none select-none" style={{ filter: 'blur(4px)', opacity: 0.4, maxHeight: 200, overflow: 'hidden' }}>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                {totalReplies} {totalReplies === 1 ? 'Reply' : 'Replies'}
              </h2>
              <div className="rounded-xl border border-border-subtle bg-surface-strong p-4">
                <div className="h-4 w-3/4 rounded bg-border-subtle" />
                <div className="mt-2 h-3 w-1/2 rounded bg-border-subtle" />
              </div>
              <div className="rounded-xl border border-border-subtle bg-surface-strong p-4">
                <div className="h-4 w-2/3 rounded bg-border-subtle" />
                <div className="mt-2 h-3 w-1/3 rounded bg-border-subtle" />
              </div>
            </div>
          </div>
          <div
            className="rounded-2xl border p-8 text-center"
            style={{ borderColor: 'var(--border-subtle)', background: 'linear-gradient(135deg, var(--purple-ghost) 0%, var(--surface-strong) 100%)' }}
          >
            <svg className="mx-auto mb-3 h-8 w-8" style={{ color: 'var(--purple)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <h3 className="text-lg font-semibold text-foreground">Sign in to read replies</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-text-muted">
              Join the conversation — create a free account to read replies, share your experience, and connect with others on their taper journey.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/auth/signin" className="btn btn-primary text-sm no-underline">Sign In</Link>
              <Link href="/auth/signup" className="btn btn-secondary text-sm no-underline">Create Free Account</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
