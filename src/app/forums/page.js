'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useForumStore } from '@/stores/forumStore';
import { PageLoading } from '@/components/shared/LoadingSpinner';
import { getGeneralSections, getDrugClassGroups, CATEGORY_ICONS, DRUG_CLASS_ICONS } from '@/lib/forumCategories';
import SearchBar from '@/components/shared/SearchBar';
import ThreadCard from '@/components/forums/ThreadCard';

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

export default function ForumsPage() {
  const forums = useForumStore((s) => s.forums);
  const forumsLoading = useForumStore((s) => s.forumsLoading);
  const fetchForums = useForumStore((s) => s.fetchForums);
  const recentThreads = useForumStore((s) => s.recentThreads);
  const fetchTopThreads = useForumStore((s) => s.fetchTopThreads);
  const searchState = useForumStore((s) => s.searchState['global']);
  const searchFn = useForumStore((s) => s.search);

  useEffect(() => {
    fetchForums();
    fetchTopThreads(4);
  }, [fetchForums, fetchTopThreads]);

  if (forumsLoading) return <PageLoading />;

  const searchResults = searchState?.results || [];
  const searchLoading = searchState?.loading || false;
  const searchQuery = searchState?.query || '';
  const isSearching = searchQuery && searchQuery.trim().length >= 2;

  const handleSearch = (q) => searchFn(null, q);

  const generalSections = getGeneralSections(forums);
  const drugGroups = getDrugClassGroups(forums);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-eyebrow">Community</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Forums
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-text-muted">
            Connect with others who understand your tapering journey. Browse by topic or find your medication-specific community.
          </p>
        </div>
        <Link href="/thread/new" className="btn btn-primary shrink-0 no-underline">
          Start a Thread
        </Link>
      </div>

      <SearchBar onSearch={handleSearch} placeholder="Search all threads..." />

      {isSearching && (
        <div className="space-y-3">
          <p className="text-sm text-text-muted">
            {searchLoading ? 'Searching...' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`}
          </p>
          {searchResults.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      )}

      {/* Recent Activity */}
      {!isSearching && !recentThreads.loading && recentThreads.items.length > 0 && (
        <section className="glass-panel overflow-hidden">
          <div
            className="flex items-center gap-3 border-b px-6 py-4"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
          >
            <svg className="h-5 w-5" style={{ color: 'var(--purple)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h.096c.5 0 .905.405.905.905 0 .714-.211 1.412-.608 2.006L4 14.25l1.904 4.5z" />
            </svg>
            <h2 className="text-lg font-semibold text-foreground">Most Upvoted</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {recentThreads.items.map((thread) => (
              <Link
                key={thread.id}
                href={`/thread/${thread.id}`}
                className="group flex items-center gap-4 bg-surface-strong p-5 no-underline transition hover:bg-purple-ghost/50"
              >
                <div className="h-8 w-1 shrink-0 rounded-full" style={{ background: 'var(--purple-pale)' }} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground transition group-hover:text-purple">
                    {thread.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-subtle">
                    <span>{thread.profiles?.display_name || 'Anonymous'}</span>
                    <span>·</span>
                    <span>{timeAgo(thread.created_at)}</span>
                    {thread.forums && (
                      <>
                        <span>·</span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{ background: 'var(--purple-ghost)', color: 'var(--purple)' }}
                        >
                          {thread.forums.name}
                        </span>
                      </>
                    )}
                    {thread.reply_count > 0 && (
                      <>
                        <span>·</span>
                        <span>{thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}</span>
                      </>
                    )}
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
      )}

      {!isSearching && <div className="space-y-6">
        {/* General forum sections */}
        {generalSections.map((section) => (
          <section key={section.key} className="glass-panel overflow-hidden">
            <div
              className="flex items-center gap-3 border-b px-6 py-4"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
            >
              <div className="text-purple">{CATEGORY_ICONS[section.key]}</div>
              <h2 className="text-lg font-semibold text-foreground">{section.label}</h2>
              <span
                className="ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
                style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
              >
                {section.forums.length}
              </span>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {section.forums.map((forum) => (
                <Link
                  key={forum.slug}
                  href={`/forums/${forum.slug}`}
                  className="group flex items-center gap-4 bg-surface-strong p-5 no-underline transition hover:bg-purple-ghost/50"
                >
                  <div className="h-8 w-1 shrink-0 rounded-full" style={{ background: 'var(--purple)' }} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground transition group-hover:text-purple">
                      {forum.name}
                    </p>
                    {forum.description && (
                      <p className="mt-0.5 text-xs text-text-muted line-clamp-1">{forum.description}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-text-subtle">
                    {forum.post_count ?? 0} posts
                  </span>
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
        ))}

        {/* Drug-Specific Forums — grouped by class */}
        <section className="glass-panel overflow-hidden">
          <div
            className="flex items-center gap-3 border-b px-6 py-4"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
          >
            <div className="text-purple">{CATEGORY_ICONS.drug}</div>
            <h2 className="text-lg font-semibold text-foreground">Drug-Specific Forums</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
            {drugGroups.map((group) => (
              <div
                key={group.key}
                className="rounded-2xl border p-5"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: 'var(--purple-ghost)', color: 'var(--purple)' }}
                  >
                    {DRUG_CLASS_ICONS[group.key]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{group.label}</p>
                    <p className="text-[11px] text-text-subtle">{group.desc}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {group.forums.map((forum) => (
                    <Link
                      key={forum.id}
                      href={`/forums/${forum.drug_slug || forum.slug}`}
                      className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm no-underline transition hover:bg-purple-ghost/50"
                    >
                      <span className="font-medium text-foreground transition group-hover:text-purple">
                        {forum.name}
                      </span>
                      <span className="text-[11px] text-text-subtle">
                        {forum.post_count ?? 0}
                      </span>
                    </Link>
                  ))}
                  {group.forums.length === 0 && (
                    <p className="px-2 py-1.5 text-xs text-text-subtle italic">No forums yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>}
    </div>
  );
}
