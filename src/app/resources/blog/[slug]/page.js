'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useBlogStore } from '@/stores/blogStore';
import { useAuth } from '@/hooks/useAuth';
import { isPrimaryAdmin } from '@/lib/blog';
import BlogCommentSection from '@/components/blog/BlogCommentSection';
import BlogCommentForm from '@/components/blog/BlogCommentForm';
import ShareButtons from '@/components/shared/ShareButtons';

function getPreviewBody(body) {
  if (!body) return '';
  // Split on double-newlines (markdown paragraphs) and take enough
  // complete paragraphs to stay near 150 words
  const paragraphs = body.split(/\n\n+/);
  let wordCount = 0;
  const kept = [];
  for (const p of paragraphs) {
    const pWords = p.split(/\s+/).length;
    if (wordCount + pWords > 150 && kept.length > 0) break;
    kept.push(p);
    wordCount += pWords;
  }
  return kept.join('\n\n');
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { currentPost: post, currentPostLoading: loading, fetchPost, deletePost } = useBlogStore();
  const [quotedText, setQuotedText] = useState('');
  const articleRef = useRef(null);

  const isAdmin = !authLoading && isPrimaryAdmin(user?.id);
  const isSignedIn = !authLoading && !!user;

  useEffect(() => {
    if (slug) fetchPost(slug);
  }, [slug, fetchPost]);

  // Listen for text selection within the article body
  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text || text.length < 10) return;
    // Only capture selections inside the article prose area
    if (articleRef.current && articleRef.current.contains(sel.anchorNode)) {
      setQuotedText(text.length > 280 ? text.slice(0, 280) + '…' : text);
    }
  }, []);

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

  const previewBody = getPreviewBody(post.body);
  const hasMore = post.body && post.body.split(/\s+/).length > 150;

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
        <ShareButtons
          url={`https://taper.community/resources/blog/${slug}`}
          title={post.title}
          text={`${post.title} — TaperCommunity`}
        />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          datePublished: post.created_at,
          dateModified: post.updated_at || post.created_at,
          author: { '@type': 'Organization', name: 'TaperCommunity' },
          publisher: {
            '@type': 'Organization',
            name: 'TaperCommunity',
            logo: { '@type': 'ImageObject', url: 'https://taper.community/tapercommunity-logo.png' },
          },
          description: post.body?.slice(0, 160),
          image: post.cover_image_url || 'https://taper.community/tapercommunity-logo.png',
          mainEntityOfPage: `https://taper.community/resources/blog/${slug}`,
        }) }}
      />

      {isSignedIn ? (
        <>
          {/* Article body — track text selection for quoting */}
          <div
            ref={articleRef}
            onMouseUp={handleMouseUp}
            className="prose prose-sm max-w-none text-text-muted prose-headings:font-serif prose-headings:text-foreground prose-a:text-purple prose-strong:text-foreground prose-img:rounded-xl"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.body}
            </ReactMarkdown>
          </div>

          <hr style={{ borderColor: 'var(--border-subtle)' }} />

          {/* Comment list (inline, scrolls with content) */}
          <BlogCommentSection blogPostId={post.id} />

          {/* Spacer so sticky form doesn't cover last content */}
          <div className="h-44" />

          {/* Sticky comment form pinned to bottom of viewport */}
          <div
            className="fixed bottom-0 left-0 right-0 z-40 border-t"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--background)', boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}
          >
            <div className="mx-auto max-w-2xl px-4 py-3">
              {quotedText && (
                <div
                  className="mb-2 flex items-start gap-2 rounded-lg px-3 py-2 text-xs"
                  style={{ background: 'var(--purple-ghost)', color: 'var(--text-muted)' }}
                >
                  <span className="shrink-0 font-semibold" style={{ color: 'var(--purple)' }}>Quoting:</span>
                  <span className="line-clamp-2 italic">&ldquo;{quotedText}&rdquo;</span>
                  <button
                    onClick={() => setQuotedText('')}
                    className="ml-auto shrink-0 text-text-subtle hover:text-foreground"
                    aria-label="Remove quote"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <BlogCommentForm blogPostId={post.id} quotedText={quotedText} onQuoteUsed={() => setQuotedText('')} />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Preview for signed-out users */}
          <div className="relative">
            <div className="prose prose-sm max-w-none text-text-muted prose-headings:font-serif prose-headings:text-foreground prose-a:text-purple prose-strong:text-foreground prose-img:rounded-xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {previewBody}
              </ReactMarkdown>
            </div>

            {hasMore && (
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
                style={{
                  background: 'linear-gradient(to bottom, transparent, var(--background))',
                }}
              />
            )}
          </div>

          {/* Sign-in CTA */}
          <div
            className="rounded-2xl border p-8 text-center"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
          >
            <svg
              className="mx-auto h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              style={{ color: 'var(--purple)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">
              Sign in to read the full article
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              Create a <strong>free</strong> account to access the full article and discuss with others on the same journey.
            </p>
            <div className="mt-4 rounded-xl p-3" style={{ background: 'var(--purple-ghost)' }}>
              <p className="text-xs leading-relaxed text-text-muted" style={{ fontStyle: 'italic' }}>
                &ldquo;TaperCommunity is the first place that actually felt like home. The taper journal changed everything about how I approach my taper.&rdquo;
              </p>
              <p className="mt-1.5 text-[11px] font-semibold text-text-subtle">&mdash; Catina, Community Support Member</p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/auth/signin"
                className="rounded-xl border px-5 py-2.5 text-sm font-semibold no-underline transition hover:border-purple hover:text-purple"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:opacity-90"
                style={{ background: 'var(--purple)' }}
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
