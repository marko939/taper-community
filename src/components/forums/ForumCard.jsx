'use client';

import Link from 'next/link';

export default function ForumCard({ forum }) {
  const { name, drug_slug, slug, description, post_count } = forum;
  const href = drug_slug ? `/forums/${drug_slug}` : `/forums/${slug}`;

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-[var(--radius-lg)] border p-4 no-underline transition hover:shadow-elevated"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
    >
      <div className="h-8 w-1 shrink-0 rounded" style={{ background: 'var(--purple)' }} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold transition group-hover:text-purple" style={{ color: 'var(--foreground)' }}>
          {name}
        </h3>
        {description && (
          <p className="mt-1 text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>{description}</p>
        )}
        <span className="mt-2 inline-block text-xs" style={{ color: 'var(--text-subtle)' }}>
          {post_count ?? 0} posts
        </span>
      </div>
    </Link>
  );
}
