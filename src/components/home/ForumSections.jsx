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

  const generalSections = getGeneralSections(forums).filter((s) => s.key !== 'admin');
  const drugGroups = getDrugClassGroups(forums);

  // Sum post counts per section
  const sectionTiles = generalSections.map((section) => ({
    key: section.key,
    label: section.label,
    icon: CATEGORY_ICONS[section.key],
    postCount: section.forums.reduce((sum, f) => sum + (f.post_count ?? 0), 0),
    href: '/forums',
  }));

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>Forums</h2>

      {/* General sections — pyramid: 3 on top, 2 on bottom centered */}
      <div className="space-y-3">
        {/* Top row: first 3 */}
        <div className="grid grid-cols-3 gap-3">
          {sectionTiles.slice(0, 3).map((tile) => (
            <Link
              key={tile.key}
              href={tile.href}
              className="group flex flex-col items-center gap-2 rounded-2xl border p-4 no-underline transition hover:border-purple hover:shadow-elevated"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'var(--purple-ghost)', color: 'var(--purple)' }}
              >
                {tile.icon}
              </div>
              <p className="text-center text-sm font-bold text-foreground">{tile.label}</p>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
              >
                {tile.postCount} posts
              </span>
            </Link>
          ))}
        </div>
        {/* Bottom row: remaining tiles centered */}
        {sectionTiles.length > 3 && (
          <div className="flex justify-center gap-3">
            {sectionTiles.slice(3).map((tile) => (
              <Link
                key={tile.key}
                href={tile.href}
                className="group flex w-1/3 flex-col items-center gap-2 rounded-2xl border p-4 no-underline transition hover:border-purple hover:shadow-elevated"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'var(--purple-ghost)', color: 'var(--purple)' }}
                >
                  {tile.icon}
                </div>
                <p className="text-center text-sm font-bold text-foreground">{tile.label}</p>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
                >
                  {tile.postCount} posts
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Drug-Specific Forums — 3 + 3 grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--purple)' }}>{CATEGORY_ICONS.drug}</span>
          <h3 className="font-serif text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
            Drug-Specific Forums
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {drugGroups.map((group) => (
            <Link
              key={group.key}
              href="/drugs"
              className="group flex flex-col items-center gap-2 rounded-2xl border p-4 no-underline transition hover:border-purple hover:shadow-elevated"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl transition group-hover:scale-110"
                style={{ background: 'var(--purple-ghost)', color: 'var(--purple)' }}
              >
                {DRUG_CLASS_ICONS[group.key]}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">{group.label}</p>
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
