'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForumStore } from '@/stores/forumStore';
import { PageLoading } from '@/components/shared/LoadingSpinner';
import { getDrugsByClass } from '@/lib/drugs';
import { DRUG_CATEGORY_GROUPS } from '@/lib/constants';
import SearchBar from '@/components/shared/SearchBar';
import ThreadCard from '@/components/forums/ThreadCard';

const SECTION_ORDER = [
  {
    category: 'community',
    label: 'Community',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    category: 'tapering',
    label: 'Tapering & Symptoms',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    category: 'lifestyle',
    label: 'Relationships & Lifestyle',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    category: 'research',
    label: 'Research & News',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
  },
  {
    category: 'drug',
    label: 'Drug-Specific Forums',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
];

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

  const grouped = {};
  for (const forum of forums) {
    const cat = forum.category;
    if (cat === 'start') continue;
    if (forum.name?.toLowerCase().includes('read this first')) continue;
    const normalizedCat = cat === 'general' ? 'community' : cat === 'resources' ? 'research' : cat;
    if (!grouped[normalizedCat]) grouped[normalizedCat] = [];
    grouped[normalizedCat].push(forum);
  }

  const DISPLAY_NAMES = {
    'support': "I'm Struggling",
    'success-stories': "I'm Crushing It",
  };
  for (const cat of Object.keys(grouped)) {
    if (cat === 'community') {
      const keepSlugs = ['introductions', 'support', 'success-stories'];
      const kept = grouped[cat].filter((f) =>
        keepSlugs.some((s) => f.slug?.includes(s) || f.name?.toLowerCase().includes(s.replace('-', ' ')))
      );
      grouped[cat] = kept.length > 0 ? kept : grouped[cat].slice(0, 3);
      grouped[cat] = grouped[cat].map((f) => {
        const override = Object.entries(DISPLAY_NAMES).find(([slug]) =>
          f.slug?.includes(slug) || f.name?.toLowerCase().includes(slug.replace('-', ' '))
        );
        return override ? { ...f, name: override[1] } : f;
      });
    } else if (cat !== 'drug') {
      grouped[cat].sort((a, b) => (b.post_count || 0) - (a.post_count || 0));
      grouped[cat] = grouped[cat].slice(0, 1);
    }
  }

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
        {SECTION_ORDER.map(({ category, label, icon }) => {
          if (category === 'drug') {
            const drugsByClass = getDrugsByClass();
            const CATEGORY_ICONS = {
              SSRI: <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>,
              SNRI: <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
              Benzo: <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>,
              TCA: <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
              Antipsychotic: <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>,
              Other: <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            };

            return (
              <section key={category} className="glass-panel overflow-hidden">
                <div
                  className="flex items-center gap-3 border-b px-6 py-4"
                  style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
                >
                  <div className="text-purple">{icon}</div>
                  <h2 className="text-lg font-semibold text-foreground">{label}</h2>
                </div>
                <div className="grid grid-cols-3 gap-4 p-5">
                  {DRUG_CATEGORY_GROUPS.map((cat) => {
                    const drugs = cat.classes.flatMap((c) => drugsByClass[c] || []);
                    return (
                      <Link
                        key={cat.key}
                        href="/drugs"
                        className="group flex flex-col items-center gap-3 rounded-2xl border p-5 no-underline transition hover:border-purple hover:shadow-elevated"
                        style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
                      >
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-110"
                          style={{ background: 'var(--purple-ghost)', color: 'var(--purple)' }}
                        >
                          {CATEGORY_ICONS[cat.key]}
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-foreground">{cat.label}</p>
                          <p className="mt-0.5 text-[11px] text-text-subtle">{cat.desc}</p>
                        </div>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                          style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
                        >
                          {drugs.length} {drugs.length === 1 ? 'drug' : 'drugs'}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          }

          const sectionForums = grouped[category];
          if (!sectionForums || sectionForums.length === 0) return null;

          return (
            <section key={category} className="glass-panel overflow-hidden">
              <div
                className="flex items-center gap-3 border-b px-6 py-4"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
              >
                <div className="text-purple">{icon}</div>
                <h2 className="text-lg font-semibold text-foreground">{label}</h2>
                <span
                  className="ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
                >
                  {sectionForums.length}
                </span>
              </div>

              <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {sectionForums.map((forum) => {
                  const href = `/forums/${forum.slug || forum.id}`;
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
          );
        })}
      </div>}
    </div>
  );
}
