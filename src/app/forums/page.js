'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useForumStore } from '@/stores/forumStore';
import { PageLoading } from '@/components/shared/LoadingSpinner';
import { groupForums, CATEGORY_ICONS } from '@/lib/forumCategories';
import SearchBar from '@/components/shared/SearchBar';
import ThreadCard from '@/components/forums/ThreadCard';

export default function ForumsPage() {
  const forums = useForumStore((s) => s.forums);
  const forumsLoading = useForumStore((s) => s.forumsLoading);
  const fetchForums = useForumStore((s) => s.fetchForums);
  const searchState = useForumStore((s) => s.searchState['global']);
  const searchFn = useForumStore((s) => s.search);

  useEffect(() => {
    fetchForums();
  }, [fetchForums]);

  if (forumsLoading) return <PageLoading />;

  const searchResults = searchState?.results || [];
  const searchLoading = searchState?.loading || false;
  const searchQuery = searchState?.query || '';
  const isSearching = searchQuery && searchQuery.trim().length >= 2;

  const handleSearch = (q) => searchFn(null, q);

  const sections = groupForums(forums);

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

      {!isSearching && <div className="space-y-6">
        {sections.map((section) => (
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
              {section.forums.map((forum) => {
                const href = forum.drug_slug ? `/forums/${forum.drug_slug}` : `/forums/${forum.slug || forum.id}`;
                return (
                  <Link
                    key={forum.id}
                    href={href}
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
                );
              })}
            </div>
          </section>
        ))}
      </div>}
    </div>
  );
}
