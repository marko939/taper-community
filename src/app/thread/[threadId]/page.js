'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useThreadStore } from '@/stores/threadStore';
import ThreadView from '@/components/thread/ThreadView';
import ReplyList from '@/components/thread/ReplyList';
import ReplyForm from '@/components/thread/ReplyForm';
import DeprescriberCTA from '@/components/layout/DeprescriberCTA';
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

  if (loading) return <PageLoading />;

  if (!thread) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Thread not found</h1>
        <Link href="/forums" className="mt-4 inline-block font-medium text-accent-blue hover:underline">Back to Forums</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/forums" className="text-sm text-text-subtle hover:text-foreground">
        &larr; Back to Forums
      </Link>

      <ThreadView thread={thread} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        <ReplyList
          replies={replies}
          hasMore={hasMoreReplies}
          totalCount={totalReplies}
          onLoadMore={() => loadMoreReplies(threadId)}
        />
        <ReplyForm threadId={threadId} />
      </div>

      <DeprescriberCTA className="mt-8" />
    </div>
  );
}
