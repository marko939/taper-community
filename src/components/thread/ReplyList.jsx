'use client';

import Link from 'next/link';
import Avatar from '@/components/shared/Avatar';
import { PeerAdvisorBadge } from '@/components/shared/Badge';
import VoteButton from '@/components/shared/VoteButton';
import DrugSignature from '@/components/shared/DrugSignature';

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function ReplyList({ replies = [], hasMore = false, totalCount, onLoadMore }) {
  if (replies.length === 0) return null;

  return (
    <div className="space-y-4">
      {replies.map((reply) => {
        const displayName = reply.profiles?.display_name || 'Anonymous';

        return (
          <div key={reply.id} className="card">
            <div className="flex gap-3">
              <div className="shrink-0 pt-1">
                <VoteButton type="reply" targetId={reply.id} initialScore={reply.vote_score || 0} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <Avatar name={displayName} avatarUrl={reply.profiles?.avatar_url} size="sm" foundingMember={reply.profiles?.is_founding_member} />
                  <Link href={`/profile/${reply.user_id}`} className="font-semibold text-foreground no-underline hover:text-accent-blue">
                    {displayName}
                  </Link>
                  {reply.profiles?.is_peer_advisor && <PeerAdvisorBadge />}
                  <span className="text-xs text-text-subtle">{timeAgo(reply.created_at)}</span>
                </div>

                {reply.profiles?.drug && (
                  <p className="mt-1 text-xs text-text-subtle">
                    {reply.profiles.drug} &middot; {reply.profiles.taper_stage}
                  </p>
                )}

                <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
                  {reply.body}
                </div>

                <DrugSignature signature={reply.profiles?.drug_signature} />
              </div>
            </div>
          </div>
        );
      })}

      {hasMore && onLoadMore && (
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={onLoadMore}
            className="rounded-xl px-6 py-2.5 text-sm font-medium transition hover:bg-purple-ghost"
            style={{ color: 'var(--purple)', border: '1px solid var(--border-subtle)' }}
          >
            Load more replies
            {totalCount != null && (
              <span className="ml-2 text-xs text-text-subtle">
                ({replies.length} of {totalCount})
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
