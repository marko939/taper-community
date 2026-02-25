'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useBlogStore } from '@/stores/blogStore';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_USER_ID } from '@/lib/blog';

export default function BlogPostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { currentPost: post, currentPostLoading: loading, fetchPost, deletePost } = useBlogStore();

  const isAdmin = !authLoading && user?.id === ADMIN_USER_ID;

  useEffect(() => {
    if (slug) fetchPost(slug);
  }, [slug, fetchPost]);

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    await deletePost(post.id);
    router.push('/resources');
  };

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
      <div className="flex items-center justify-between">
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted no-underline transition hover:text-purple"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Resources
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link
              href={`/resources/blog/admin?edit=${post.id}`}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-purple no-underline transition hover:bg-purple-ghost"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-500 transition hover:bg-rose-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

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

      <div className="prose prose-sm max-w-none text-text-muted prose-headings:font-serif prose-headings:text-foreground prose-a:text-purple prose-strong:text-foreground prose-img:rounded-xl">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.body}
        </ReactMarkdown>
      </div>
    </div>
  );
}
