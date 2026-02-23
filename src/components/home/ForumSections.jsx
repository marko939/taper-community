'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useForumStore } from '@/stores/forumStore';
import { getGeneralSections, getDrugClassGroups, CATEGORY_ICONS, DRUG_CLASS_ICONS } from '@/lib/forumCategories';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

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

export default function ForumSections() {
  const forums = useForumStore((s) => s.forums);
  const loading = useForumStore((s) => s.forumsLoading);
  const fetchForums = useForumStore((s) => s.fetchForums);
  const recentThreads = useForumStore((s) => s.recentThreads);
  const fetchRecentThreads = useForumStore((s) => s.fetchRecentThreads);

  useEffect(() => {
    fetchForums();
    fetchRecentThreads(4);
  }, [fetchForums, fetchRecentThreads]);

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

      {/* Recent Activity */}
      {!recentThreads.loading && recentThreads.items.length > 0 && (
        <div className="glass-panel overflow-hidden">
          <div
            className="flex items-center gap-3 border-b px-5 py-3"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
          >
            <span style={{ color: 'var(--purple)' }}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--purple)' }}>
              Recent Activity
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
            {recentThreads.items.map((thread) => (
              <Link
                key={thread.id}
                href={`/thread/${thread.id}`}
                className="group block px-5 py-4 no-underline transition hover:bg-purple-ghost/50"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-1 shrink-0 rounded" style={{ background: 'var(--purple-pale)' }} />
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-[15px] font-semibold transition group-hover:text-purple" style={{ color: 'var(--foreground)' }}>
                      {thread.title}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                        {thread.profiles?.display_name || 'Anonymous'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>·</span>
                      <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                        {timeAgo(thread.created_at)}
                      </span>
                      {thread.forums && (
                        <>
                          <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>·</span>
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
                          <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>·</span>
                          <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                            {thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
