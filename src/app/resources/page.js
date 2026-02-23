'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDrugsByClass } from '@/lib/drugs';
import { DRUG_CATEGORY_GROUPS } from '@/lib/constants';
import { DRUG_CLASS_ICONS as CATEGORY_ICONS } from '@/lib/forumCategories';
import { useBlogStore } from '@/stores/blogStore';

const TABS = [
  {
    key: 'blog',
    label: 'Blog',
    desc: 'Articles & insights',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    key: 'drugs',
    label: 'Drug Profiles',
    desc: 'Medication guides & tapering info',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    key: 'resources',
    label: 'Resources',
    desc: 'Guides, tools & links',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
];

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState('blog');
  const drugsByClass = getDrugsByClass();
  const [expanded, setExpanded] = useState(null);
  const { posts, postsLoading, fetchPosts } = useBlogStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="space-y-8">
      <div>
        <p className="section-eyebrow">Resources</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
          Resource Hub
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-muted">
          Drug profiles, blog articles, and curated resources for your tapering journey.
        </p>
      </div>

      {/* Tab selector cards */}
      <div className="grid grid-cols-3 gap-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="group flex flex-col items-center gap-3 rounded-2xl border p-5 transition hover:border-purple hover:shadow-elevated"
              style={{
                borderColor: isActive ? 'var(--purple)' : 'var(--border-subtle)',
                background: isActive ? 'var(--purple-ghost)' : 'var(--surface-strong)',
              }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-110"
                style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
              >
                {tab.icon}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">{tab.label}</p>
                <p className="mt-0.5 text-[11px] text-text-subtle">{tab.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'drugs' && (
        <div className="grid grid-cols-3 gap-4">
          {DRUG_CATEGORY_GROUPS.map((cat) => {
            const drugs = cat.classes.flatMap((c) => drugsByClass[c] || []);
            const isExpanded = expanded === cat.key;

            return (
              <div key={cat.key} className="flex flex-col">
                <button
                  onClick={() => setExpanded(isExpanded ? null : cat.key)}
                  className="group flex flex-col items-center gap-3 rounded-2xl border p-5 transition hover:border-purple hover:shadow-elevated"
                  style={{
                    borderColor: isExpanded ? 'var(--purple)' : 'var(--border-subtle)',
                    background: isExpanded ? 'var(--purple-ghost)' : 'var(--surface-strong)',
                  }}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-110"
                    style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
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
                </button>

                {isExpanded && (
                  <div className="mt-2 space-y-1">
                    {drugs.map((drug) => (
                      <Link
                        key={drug.slug}
                        href={`/drugs/${drug.slug}`}
                        className="group flex items-center gap-3 rounded-xl border px-4 py-3 no-underline transition hover:border-purple hover:bg-purple-ghost/50"
                        style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground transition group-hover:text-purple">
                            {drug.name}
                          </p>
                          <p className="text-[11px] text-text-subtle">{drug.generic}</p>
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
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'blog' && (
        <div>
          {postsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}>
              <svg className="mx-auto h-12 w-12 text-text-subtle" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="mt-4 text-sm font-semibold text-foreground">No blog posts yet</p>
              <p className="mt-1 text-xs text-text-muted">Check back soon for articles and insights.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/resources/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl border no-underline transition hover:border-purple hover:shadow-elevated"
                  style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
                >
                  {post.cover_image_url && (
                    <div className="aspect-[16/9] overflow-hidden rounded-t-2xl">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-sm font-bold text-foreground transition group-hover:text-purple">
                      {post.title}
                    </p>
                    {post.excerpt && (
                      <p className="mt-1.5 line-clamp-2 text-xs text-text-muted">{post.excerpt}</p>
                    )}
                    <div className="mt-auto flex items-center gap-2 pt-4">
                      <span className="text-[11px] text-text-subtle">
                        {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Maudsley Deprescribing Guidelines */}
          <a
            href="https://www.sfu-ljubljana.si/sites/default/files/2025-04/Mark%20Horowitz%2C%20David%20M.%20Taylor%20-%20The%20Maudsley%20Deprescribing%20Guidelines_%20Antidepressants%2C%20Benzodiazepines%2C%20Gabapentinoids.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 rounded-2xl border p-6 no-underline transition hover:border-purple hover:shadow-elevated"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
          >
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-110"
              style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground transition group-hover:text-purple">
                The Maudsley Deprescribing Guidelines
              </p>
              <p className="mt-1 text-xs text-text-muted">
                By Mark Horowitz & David Taylor. Evidence-based guidance for tapering antidepressants, benzodiazepines, and gabapentinoids.
              </p>
              <span
                className="mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                PDF
              </span>
            </div>
          </a>

          {/* Ashton Manual */}
          <a
            href="https://www.benzoinfo.com/wp-content/uploads/2022/07/Ashton-Manual.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 rounded-2xl border p-6 no-underline transition hover:border-purple hover:shadow-elevated"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
          >
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-110"
              style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground transition group-hover:text-purple">
                The Ashton Manual
              </p>
              <p className="mt-1 text-xs text-text-muted">
                By Professor C. Heather Ashton. The definitive guide to benzodiazepine withdrawal and tapering protocols.
              </p>
              <span
                className="mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                PDF
              </span>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}
