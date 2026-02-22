'use client';

import Link from 'next/link';
import { useRecentThreads } from '@/hooks/useForumData';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function RecentActivity() {
  const { threads, loading } = useRecentThreads(3);

  return (
    <section>
      <h2 className="mb-1 font-serif text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>Latest Discussions</h2>
      <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>See what the community is talking about right now.</p>

      {loading ? (
        <LoadingSpinner className="py-8" />
      ) : threads.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No activity yet. Be the first to post!</p>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/thread/${thread.id}`}
              className="group block rounded-[var(--radius-lg)] border p-5 no-underline transition hover:shadow-elevated"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate font-medium transition group-hover:text-purple" style={{ color: 'var(--foreground)' }}>
                    {thread.title}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-subtle)' }}>
                    {thread.forums?.name && (
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
                      >
                        {thread.forums.name}
                      </span>
                    )}
                    <span>by {thread.profiles?.display_name}</span>
                    <span>&middot;</span>
                    <span>{timeAgo(thread.created_at)}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right text-xs" style={{ color: 'var(--text-subtle)' }}>
                  <div>{thread.reply_count} replies</div>
                  <div>{thread.view_count} views</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
