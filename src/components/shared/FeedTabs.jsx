'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useForumStore } from '@/stores/forumStore';
import { useAuthStore } from '@/stores/authStore';
import { useFollowStore } from '@/stores/followStore';
import { GENERAL_FORUMS } from '@/lib/forumCategories';
import FollowButton from '@/components/shared/FollowButton';

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

function ThreadRow({ thread, rank }) {
  return (
    <Link
      href={`/thread/${thread.id}`}
      className="group flex items-center gap-4 bg-surface-strong p-5 no-underline transition hover:bg-purple-ghost/50"
    >
      {rank != null && (
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
          style={{
            background: rank < 3 ? 'var(--purple)' : 'var(--purple-pale)',
            color: rank < 3 ? '#fff' : 'var(--purple)',
          }}
        >
          {rank + 1}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground transition group-hover:text-purple">
          {thread.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-subtle">
          <span className="flex items-center gap-0.5">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {thread.vote_score || 0}
          </span>
          <span>·</span>
          <span>{thread.reply_count || 0} replies</span>
          <span>·</span>
          <span>{thread.profiles?.display_name || 'Anonymous'}</span>
          <FollowButton targetUserId={thread.user_id} />
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
  );
}

export default function FeedTabs({ activeTab: controlledTab, onTabChange, useUrlParams = false }) {
  const user = useAuthStore((s) => s.user);
  const recentThreads = useForumStore((s) => s.recentThreads);
  const newThreads = useForumStore((s) => s.newThreads);
  const fetchHotThreads = useForumStore((s) => s.fetchHotThreads);
  const fetchNewThreads = useForumStore((s) => s.fetchNewThreads);
  const followedThreads = useFollowStore((s) => s.followedThreads);
  const following = useFollowStore((s) => s.following);
  const followingLoaded = useFollowStore((s) => s.followingLoaded);
  const fetchFollowing = useFollowStore((s) => s.fetchFollowing);
  const fetchFollowedThreads = useFollowStore((s) => s.fetchFollowedThreads);

  const [localTab, setLocalTab] = useState('new');
  const activeTab = controlledTab ?? localTab;
  const [expanded, setExpanded] = useState(false);
  const [showingMore, setShowingMore] = useState(false);

  // Refs for debounce and abort
  const debounceRef = useRef(null);
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  // Fetch the active tab's data — called on mount and debounced on tab switch
  const fetchForTab = useCallback((tab, { force = false } = {}) => {
    if (tab === 'hot') {
      fetchHotThreads(10, { force });
    } else if (tab === 'new') {
      fetchNewThreads(10, { force });
    } else if (tab === 'following' && followingLoaded) {
      fetchFollowedThreads({ force });
    }
  }, [fetchHotThreads, fetchNewThreads, fetchFollowedThreads, followingLoaded]);

  // Initial fetch for active tab on mount
  useEffect(() => {
    fetchHotThreads(10);
    fetchNewThreads(10);
  }, [fetchHotThreads, fetchNewThreads]);

  useEffect(() => {
    if (user?.id) fetchFollowing(user.id);
  }, [user?.id, fetchFollowing]);

  useEffect(() => {
    if (followingLoaded) {
      fetchFollowedThreads();
    }
  }, [followingLoaded, fetchFollowedThreads]);

  // Debounced tab switch — UI updates immediately, fetch fires after 150ms settle
  const switchTab = useCallback((tab) => {
    setExpanded(false);
    setShowingMore(false);

    // Update tab UI immediately (feels snappy)
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setLocalTab(tab);
    }

    // Cancel any pending debounced fetch
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Debounce the fetch — if another click comes within 150ms, this gets cancelled
    debounceRef.current = setTimeout(() => {
      fetchForTab(tab);
    }, 150);
  }, [onTabChange, fetchForTab]);

  // Safety timeout — if loading is stuck for 10 seconds, force reset
  let currentThreads, currentLoading;
  if (activeTab === 'hot') {
    currentThreads = recentThreads.items || [];
    currentLoading = recentThreads.loading;
  } else if (activeTab === 'new') {
    currentThreads = newThreads.items || [];
    currentLoading = newThreads.loading;
  } else {
    currentThreads = followedThreads.items || [];
    currentLoading = followedThreads.loading;
  }

  useEffect(() => {
    if (!currentLoading) return;
    const safety = setTimeout(() => {
      // Force-reset loading state for the stuck tab
      const tab = activeTabRef.current;
      if (tab === 'hot') {
        useForumStore.setState({ recentThreads: { items: useForumStore.getState().recentThreads.items || [], loading: false }, hotThreadsLoaded: true });
      } else if (tab === 'new') {
        useForumStore.setState({ newThreads: { items: useForumStore.getState().newThreads.items || [], loading: false }, newThreadsLoaded: true });
      } else {
        useFollowStore.setState({ followedThreads: { items: useFollowStore.getState().followedThreads.items || [], loading: false }, followedThreadsLoaded: true });
      }
      console.warn('[tab-switcher] safety timeout triggered — force reset loading for tab:', tab);
    }, 10000);
    return () => clearTimeout(safety);
  }, [currentLoading]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Show more — protected from double-clicks
  const handleShowMore = useCallback(() => {
    if (showingMore) return;
    setShowingMore(true);
    setExpanded(true);
    // Reset after a brief moment so it can be used again if needed
    setTimeout(() => setShowingMore(false), 300);
  }, [showingMore]);

  const visibleItems = expanded ? currentThreads.slice(0, 10) : currentThreads.slice(0, 5);
  const canExpand = currentThreads.length > 5 && !expanded;

  const tabs = [
    { key: 'new', label: 'New', subtitle: 'Latest threads' },
    { key: 'hot', label: 'Hot', subtitle: 'Top this week' },
    { key: 'following', label: 'Following', subtitle: 'From people you follow' },
  ];

  return (
    <section className="glass-panel overflow-hidden">
      <div
        className="flex items-center gap-1 border-b px-6 py-3"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition"
            style={{
              background: activeTab === tab.key ? 'var(--purple)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--text-muted)',
            }}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-2 text-xs text-text-subtle">
          {tabs.find((t) => t.key === activeTab)?.subtitle}
        </span>
      </div>

      {currentLoading ? (
        <div className="p-8 text-center text-sm text-text-muted">Loading...</div>
      ) : activeTab === 'following' && !user ? (
        <div className="px-6 py-8 text-center text-sm text-text-muted">
          <Link href="/auth/signin" className="font-medium" style={{ color: 'var(--purple)' }}>Sign in</Link> to see posts from people you follow.
        </div>
      ) : activeTab === 'following' && following.size === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-text-muted">
          You are not following anyone yet. Follow members to see their posts here.{' '}
          <Link href="/forums/introductions" className="font-medium" style={{ color: 'var(--purple)' }}>Browse Introductions</Link>
        </div>
      ) : currentThreads.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted">No threads yet.</div>
      ) : (
        <>
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {visibleItems.map((thread, i) => (
              <ThreadRow
                key={thread.id}
                thread={thread}
                rank={activeTab === 'hot' ? i : null}
              />
            ))}
          </div>
          {canExpand && (
            <button
              onClick={handleShowMore}
              disabled={showingMore}
              className="flex w-full items-center justify-center gap-2 border-t px-6 py-3 text-sm font-semibold transition hover:bg-purple-ghost/50"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--purple)' }}
            >
              Show more
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          )}
        </>
      )}
    </section>
  );
}
