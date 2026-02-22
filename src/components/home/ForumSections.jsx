'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useForumStore } from '@/stores/forumStore';
import { groupForums, CATEGORY_ICONS } from '@/lib/forumCategories';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

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

  const sections = groupForums(forums, { drugLimit: 6 });

  return (
    <div className="space-y-8">
      <h2 className="font-serif text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>Forums</h2>
      {sections.map((section) => (
        <div key={section.key} className="glass-panel overflow-hidden">
          <div
            className="flex items-center gap-3 border-b px-5 py-3"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
          >
            <span style={{ color: 'var(--purple)' }}>{CATEGORY_ICONS[section.key]}</span>
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
      ))}
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
