'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useThreadData } from '@/hooks/useThreadData';
import ThreadView from '@/components/thread/ThreadView';
import ReplyList from '@/components/thread/ReplyList';
import ReplyForm from '@/components/thread/ReplyForm';
import AISidebar from '@/components/thread/AISidebar';
import DeprescriberCTA from '@/components/layout/DeprescriberCTA';
import { PageLoading } from '@/components/shared/LoadingSpinner';

export default function ThreadPage() {
  const { threadId } = useParams();
  const { thread, replies, loading, setReplies, hasMoreReplies, totalReplies, loadMoreReplies } = useThreadData(threadId);

  if (loading) return <PageLoading />;

  if (!thread) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Thread not found</h1>
        <Link href="/forums" className="mt-4 inline-block font-medium text-accent-blue hover:underline">Back to Forums</Link>
      </div>
    );
  }

  const handleReplyAdded = (newReply) => {
    setReplies((prev) => [...prev, newReply]);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
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
            onLoadMore={loadMoreReplies}
          />
          <ReplyForm threadId={threadId} onReplyAdded={handleReplyAdded} />
        </div>

        <DeprescriberCTA className="mt-8" />
      </div>

      <aside className="space-y-6">
        <AISidebar threadId={threadId} />
      </aside>
    </div>
  );
}
