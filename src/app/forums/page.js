'use client';

import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForumStore } from '@/stores/forumStore';
import { useAuthStore } from '@/stores/authStore';
import { PageLoading } from '@/components/shared/LoadingSpinner';
import { getGeneralSections, getDrugClassGroups, CATEGORY_ICONS, DRUG_CLASS_ICONS } from '@/lib/forumCategories';
import SearchBar from '@/components/shared/SearchBar';
import ThreadCard from '@/components/forums/ThreadCard';
import FeedTabs from '@/components/shared/FeedTabs';

export default function ForumsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ForumsContent />
    </Suspense>
  );
}

function ForumsContent() {
  const user = useAuthStore((s) => s.user);
  const forums = useForumStore((s) => s.forums);
  const forumsLoading = useForumStore((s) => s.forumsLoading);
  const fetchForums = useForumStore((s) => s.fetchForums);
  const searchState = useForumStore((s) => s.searchState['global']);
  const searchFn = useForumStore((s) => s.search);

  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'hot';

  useEffect(() => {
    useForumStore.getState().invalidate();
    fetchForums();
  }, [fetchForums]);

  if (forumsLoading) return <PageLoading />;

  const searchResults = searchState?.results || [];
  const searchLoading = searchState?.loading || false;
  const searchQuery = searchState?.query || '';
  const isSearching = searchQuery && searchQuery.trim().length >= 2;

  const handleSearch = (q) => searchFn(null, q);

  const switchTab = (tab) => {
    router.replace(`/forums?tab=${tab}`, { scroll: false });
  };

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

      {/* 3-Tab Switcher: Hot | New | Following */}
      {!isSearching && (
        <FeedTabs activeTab={activeTab} onTabChange={switchTab} useUrlParams />
      )}

      {/* Forum Categories */}
      {!isSearching && (
        <div className="space-y-6">
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
        </div>
      )}
    </div>
  );
}
