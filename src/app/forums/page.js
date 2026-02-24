'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForumStore } from '@/stores/forumStore';
import { useAuthStore } from '@/stores/authStore';
import { PageLoading } from '@/components/shared/LoadingSpinner';
import { getGeneralSections, getDrugClassGroups, CATEGORY_ICONS, DRUG_CLASS_ICONS, GENERAL_FORUMS } from '@/lib/forumCategories';
import SearchBar from '@/components/shared/SearchBar';
import ThreadCard from '@/components/forums/ThreadCard';
import FollowedThreads from '@/components/home/FollowedThreads';

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
  const user = useAuthStore((s) => s.user);
  const forums = useForumStore((s) => s.forums);
  const forumsLoading = useForumStore((s) => s.forumsLoading);
  const fetchForums = useForumStore((s) => s.fetchForums);
  const recentThreads = useForumStore((s) => s.recentThreads);
  const fetchHotThreads = useForumStore((s) => s.fetchHotThreads);
  const searchState = useForumStore((s) => s.searchState['global']);
  const searchFn = useForumStore((s) => s.search);
  const [hotExpanded, setHotExpanded] = useState(false);

  useEffect(() => {
    fetchForums();
    fetchHotThreads(15);
  }, [fetchForums, fetchHotThreads]);

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

      {/* Hot Posts */}
      {!isSearching && !recentThreads.loading && recentThreads.items.length > 0 && (() => {
        const visibleThreads = hotExpanded ? recentThreads.items.slice(0, 10) : recentThreads.items.slice(0, 4);
        const canExpand = recentThreads.items.length > 4;

        return (
          <section className="glass-panel overflow-hidden">
            <div
              className="flex items-center gap-3 border-b px-6 py-4"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
            >
              <svg className="h-5 w-5" style={{ color: '#EF6C00' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
              </svg>
              <h2 className="text-lg font-semibold text-foreground">Hot Right Now</h2>
              <span className="ml-1 text-xs text-text-subtle">trending this week</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {visibleThreads.map((thread, i) => (
                <Link
                  key={thread.id}
                  href={`/thread/${thread.id}`}
                  className="group flex items-center gap-4 bg-surface-strong p-5 no-underline transition hover:bg-purple-ghost/50"
                >
                  {/* Rank number */}
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                    style={{
                      background: i < 3 ? 'var(--purple)' : 'var(--purple-pale)',
                      color: i < 3 ? '#fff' : 'var(--purple)',
                    }}
                  >
                    {i + 1}
                  </span>
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
            {canExpand && (
              <button
                onClick={() => setHotExpanded(!hotExpanded)}
                className="flex w-full items-center justify-center gap-2 border-t px-6 py-3 text-sm font-semibold transition hover:bg-purple-ghost/50"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--purple)' }}
              >
                {hotExpanded ? 'Show less' : 'Show more'}
                <svg
                  className={`h-4 w-4 transition ${hotExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            )}
          </section>
        );
      })()}

      {/* From People You Follow */}
      {!isSearching && user && <FollowedThreads />}

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
