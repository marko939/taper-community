'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useForumStore } from '@/stores/forumStore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const SECTION_ICONS = {
  start: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
  community: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  tapering: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  lifestyle: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  research: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
};

export default function ForumSections() {
  const forums = useForumStore((s) => s.forums);
  const loading = useForumStore((s) => s.forumsLoading);
  const fetchForums = useForumStore((s) => s.fetchForums);

  useEffect(() => {
    fetchForums();
  }, [fetchForums]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const sections = [
    { key: 'start', label: 'Getting Started', forums: forums.filter((f) => f.category === 'start') },
    { key: 'community', label: 'Community', forums: forums.filter((f) => f.category === 'community') },
    { key: 'tapering', label: 'Tapering & Symptoms', forums: forums.filter((f) => f.category === 'tapering') },
    { key: 'lifestyle', label: 'Lifestyle & Wellness', forums: forums.filter((f) => f.category === 'lifestyle') },
    { key: 'research', label: 'Research & News', forums: forums.filter((f) => f.category === 'research' || f.category === 'resources') },
  ];

  return (
    <div className="space-y-8">
      <h2 className="font-serif text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>Forums</h2>
      {sections.map((section) => {
        if (section.forums.length === 0) return null;
        return (
          <div key={section.key} className="glass-panel overflow-hidden">
            <div
              className="flex items-center gap-3 border-b px-5 py-3"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
            >
              <span style={{ color: 'var(--purple)' }}>{SECTION_ICONS[section.key]}</span>
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--purple)' }}>
                {section.label}
              </h3>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
              {section.forums.map((forum) => (
                <ForumRow key={forum.id} forum={forum} />
              ))}
            </div>
          </div>
        );
      })}
      <div className="text-center">
        <Link href="/forums" className="btn btn-secondary text-sm no-underline">
          View All Forums
        </Link>
      </div>
    </div>
  );
}

function ForumRow({ forum }) {
  const href = forum.drug_slug ? `/forums/${forum.drug_slug}` : `/forums/${forum.slug}`;

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-5 py-4 no-underline transition hover:bg-purple-ghost/50"
    >
      <div className="h-8 w-1 shrink-0 rounded" style={{ background: 'var(--purple-pale)' }} />
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-[15px] font-semibold transition group-hover:text-purple" style={{ color: 'var(--foreground)' }}>
          {forum.name}
        </h4>
        <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--text-subtle)' }}>{forum.description}</p>
      </div>
      <span className="shrink-0 text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>{forum.post_count ?? 0} posts</span>
    </Link>
  );
}
