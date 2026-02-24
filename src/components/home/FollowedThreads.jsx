'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useFollowStore } from '@/stores/followStore';
import { GENERAL_FORUMS } from '@/lib/forumCategories';

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

export default function FollowedThreads() {
  const user = useAuthStore((s) => s.user);
  const following = useFollowStore((s) => s.following);
  const followingLoaded = useFollowStore((s) => s.followingLoaded);
  const fetchFollowing = useFollowStore((s) => s.fetchFollowing);
  const followedThreads = useFollowStore((s) => s.followedThreads);
  const fetchFollowedThreads = useFollowStore((s) => s.fetchFollowedThreads);

  useEffect(() => {
    if (user?.id) fetchFollowing(user.id);
  }, [user?.id, fetchFollowing]);

  useEffect(() => {
    if (followingLoaded && following.size > 0) {
      fetchFollowedThreads();
    }
  }, [followingLoaded, following.size, fetchFollowedThreads]);

  if (!user || !followingLoaded) return null;
  if (following.size === 0) return null;

  const threads = followedThreads.items;
  const loading = followedThreads.loading;

  if (loading) {
    return (
      <section className="glass-panel overflow-hidden">
        <div
          className="flex items-center gap-3 border-b px-6 py-4"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
        >
          <svg className="h-5 w-5" style={{ color: 'var(--purple)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-foreground">From People You Follow</h2>
        </div>
        <div className="p-6">
          <div className="h-16 animate-pulse rounded-xl" style={{ background: 'var(--surface-glass)' }} />
        </div>
      </section>
    );
  }

  if (threads.length === 0) {
    return (
      <section className="glass-panel overflow-hidden">
        <div
          className="flex items-center gap-3 border-b px-6 py-4"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
        >
          <svg className="h-5 w-5" style={{ color: 'var(--purple)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-foreground">From People You Follow</h2>
        </div>
        <div className="px-6 py-8 text-center text-sm text-text-muted">
          Follow more people to see their posts here
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel overflow-hidden">
      <div
        className="flex items-center gap-3 border-b px-6 py-4"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
      >
        <svg className="h-5 w-5" style={{ color: 'var(--purple)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
        <h2 className="text-lg font-semibold text-foreground">From People You Follow</h2>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {threads.map((thread) => (
          <Link
            key={thread.id}
            href={`/thread/${thread.id}`}
            className="group flex items-center gap-4 bg-surface-strong p-5 no-underline transition hover:bg-purple-ghost/50"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground transition group-hover:text-purple">
                {thread.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-subtle">
                <span className="flex items-center gap-0.5">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  {thread.vote_score || 0}
                </span>
                <span>·</span>
                <span>{thread.reply_count || 0} replies</span>
                <span>·</span>
                <span>{thread.profiles?.display_name || 'Anonymous'}</span>
                <span>·</span>
                <span>{timeAgo(thread.created_at)}</span>
                {(() => {
                  const allForums = thread.thread_forums?.map((tf) => tf.forums).filter(Boolean) || [];
                  const forums = allForums.length > 0 ? allForums : thread.forums ? [thread.forums] : [];
                  return forums.length > 0 && (
                    <>
                      <span>·</span>
                      {forums.map((f, fi) => (
                        <span
                          key={fi}
                          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{ background: 'var(--purple-ghost)', color: 'var(--purple)' }}
                        >
                          {GENERAL_FORUMS.find((gf) => gf.slug === f.slug)?.name || f.name}
                        </span>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>
            <svg
              className="h-4 w-4 shrink-0 text-text-subtle transition group-hover:text-purple"
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </section>
  );
}
