'use client';

import Link from 'next/link';
import Badge, { PeerAdvisorBadge } from '@/components/shared/Badge';
import Avatar from '@/components/shared/Avatar';
import VoteButton from '@/components/shared/VoteButton';

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

export default function ThreadCard({ thread }) {
  const { id, title, body, tags = [], reply_count, view_count, vote_score, pinned, created_at, user_id, profiles } = thread;
  const displayName = profiles?.display_name || 'Anonymous';
  const bodyPreview = body?.length > 150 ? body.slice(0, 150) + '...' : body;

  return (
    <div
      className="flex gap-3 rounded-[var(--radius-lg)] border p-5 transition hover:shadow-elevated"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)', boxShadow: 'var(--shadow-soft)' }}
    >
      {/* Vote arrows */}
      <div className="shrink-0 pt-1">
        <VoteButton type="thread" targetId={id} initialScore={vote_score || 0} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {pinned && (
          <div className="mb-1 flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--purple)' }}>
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.828 3.414a2 2 0 012.828 0l1.93 1.93a2 2 0 010 2.828l-5.464 5.464a1 1 0 01-.414.257l-3.5 1a1 1 0 01-1.236-1.236l1-3.5a1 1 0 01.257-.414l5.464-5.464z" />
            </svg>
            Pinned
          </div>
        )}

        <Link href={`/thread/${id}`} className="no-underline">
          <h3 className="font-semibold transition hover:text-purple" style={{ color: 'var(--foreground)' }}>{title}</h3>
        </Link>

        {bodyPreview && (
          <p className="mt-1 text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>{bodyPreview}</p>
        )}

        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}

        <div className="mt-2.5 flex items-center gap-3 text-xs" style={{ color: 'var(--text-subtle)' }}>
          <div className="flex items-center gap-1.5">
            <Avatar name={displayName} size="sm" />
            <Link href={`/profile/${user_id}`} className="font-medium no-underline transition hover:text-purple" style={{ color: 'var(--text-muted)' }}>
              {displayName}
            </Link>
            {profiles?.is_peer_advisor && <PeerAdvisorBadge />}
          </div>
          <span>&middot;</span>
          <span>{timeAgo(created_at)}</span>
          <span>&middot;</span>
          <span>{reply_count ?? 0} replies</span>
          <span>&middot;</span>
          <span>{view_count ?? 0} views</span>
        </div>
      </div>
    </div>
  );
}
