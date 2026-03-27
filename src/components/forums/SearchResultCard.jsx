'use client';

import Link from 'next/link';
import Avatar from '@/components/shared/Avatar';

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

export default function SearchResultCard({ result }) {
  // Handle both unified search results (from search_all RPC) and legacy thread objects
  const isUnifiedResult = result.type === 'thread' || result.type === 'reply';

  if (!isUnifiedResult) {
    // Legacy thread object from forum-specific search — render as thread card
    const { id, title, body, created_at, profiles } = result;
    const displayName = profiles?.display_name || 'Anonymous';
    const bodyPreview = body?.length > 150 ? body.slice(0, 150) + '...' : body;

    return (
      <Link href={`/thread/${id}`} className="no-underline">
        <div
          className="rounded-xl border p-4 transition hover:shadow-elevated"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
        >
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {bodyPreview && (
            <p className="mt-1 text-sm leading-relaxed text-text-muted line-clamp-2">{bodyPreview}</p>
          )}
          <div className="mt-2 flex items-center gap-2 text-[11px] text-text-subtle">
            <span>{displayName}</span>
            <span>&middot;</span>
            <span>{timeAgo(created_at)}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Unified search result from search_all RPC
  const { type, title, body_preview, thread_id, author_name, author_avatar, created_at } = result;
  const isReply = type === 'reply';
  const href = `/thread/${thread_id}`;

  return (
    <Link href={href} className="no-underline">
      <div
        className="rounded-xl border p-4 transition hover:shadow-elevated"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
      >
        <div className="flex items-start gap-3">
          <Avatar name={author_name || 'Anonymous'} avatarUrl={author_avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase"
                style={{
                  background: isReply ? 'var(--purple-ghost)' : 'var(--purple-pale)',
                  color: 'var(--purple)',
                }}
              >
                {isReply ? 'Reply' : 'Thread'}
              </span>
              <span className="text-[11px] text-text-subtle">{author_name || 'Anonymous'}</span>
              <span className="text-[11px] text-text-subtle">&middot;</span>
              <span className="text-[11px] text-text-subtle">{timeAgo(created_at)}</span>
            </div>
            {title && (
              <p className="mt-1 text-sm font-semibold text-foreground">{title}</p>
            )}
            {body_preview && (
              <p className="mt-1 text-sm leading-relaxed text-text-muted line-clamp-2">
                {isReply && !title ? body_preview : body_preview}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
