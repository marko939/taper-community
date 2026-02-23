'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBlogStore } from '@/stores/blogStore';

export default function BlogPostPage() {
  const { slug } = useParams();
  const { currentPost: post, currentPostLoading: loading, fetchPost } = useBlogStore();

  useEffect(() => {
    if (slug) fetchPost(slug);
  }, [slug, fetchPost]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-foreground">Post not found</p>
        <Link href="/resources" className="mt-4 inline-block text-sm text-purple hover:underline">
          Back to Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/resources"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted no-underline transition hover:text-purple"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to Resources
      </Link>

      {post.cover_image_url && (
        <div className="overflow-hidden rounded-2xl">
          <img src={post.cover_image_url} alt={post.title} className="w-full object-cover" />
        </div>
      )}

      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-text-subtle">
            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-text-muted"
      >
        {post.body}
      </div>
    </div>
  );
}
