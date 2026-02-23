'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useForumStore } from '@/stores/forumStore';
import { getGeneralSections, getDrugClassGroups, CATEGORY_ICONS, DRUG_CLASS_ICONS } from '@/lib/forumCategories';
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

  const generalSections = getGeneralSections(forums);
  const drugGroups = getDrugClassGroups(forums);

  return (
    <div className="space-y-8">
      <h2 className="font-serif text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>Forums</h2>

      {/* General forum sections */}
      {generalSections.map((section) => (
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
              <ForumRow key={forum.slug} forum={forum} />
            ))}
          </div>
        </div>
      ))}

      {/* Drug-Specific Forums — grouped by class */}
      <div className="glass-panel overflow-hidden">
        <div
          className="flex items-center gap-3 border-b px-5 py-3"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
        >
          <span style={{ color: 'var(--purple)' }}>{CATEGORY_ICONS.drug}</span>
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--purple)' }}>
            Drug-Specific Forums
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
          {drugGroups.map((group) => (
            <Link
              key={group.key}
              href="/drugs"
              className="group flex flex-col items-center gap-2 rounded-2xl border p-4 no-underline transition hover:border-purple hover:shadow-elevated"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110"
                style={{ background: 'var(--purple-ghost)', color: 'var(--purple)' }}
              >
                {DRUG_CLASS_ICONS[group.key]}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">{group.label}</p>
                <p className="mt-0.5 text-[11px] text-text-subtle">{group.desc}</p>
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
              >
                {group.forums.length} {group.forums.length === 1 ? 'forum' : 'forums'}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link href="/forums" className="btn btn-secondary text-sm no-underline">
          View All Forums
        </Link>
      </div>
    </div>
  );
}

function ForumRow({ forum }) {
  const href = `/forums/${forum.slug}`;

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
