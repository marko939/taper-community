'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useBlogStore } from '@/stores/blogStore';
import { useAuth } from '@/hooks/useAuth';
import { isPrimaryAdmin } from '@/lib/blog';
import { DRUG_LIST } from '@/lib/drugs';
import BlogCommentSection from '@/components/blog/BlogCommentSection';
import ShareButtons from '@/components/shared/ShareButtons';

// Build drug name → slug lookup for auto-linking
const drugLookup = {};
DRUG_LIST.forEach((drug) => {
  drugLookup[drug.name.toLowerCase()] = drug.slug;
  drugLookup[drug.generic.toLowerCase()] = drug.slug;
});
const drugNames = Object.keys(drugLookup).sort((a, b) => b.length - a.length);
const drugPattern = new RegExp(`\\b(${drugNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

export default function BlogPostContent({ post }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { deletePost } = useBlogStore();
  const [quotedText, setQuotedText] = useState('');
  const articleRef = useRef(null);

  const isAdmin = !authLoading && isPrimaryAdmin(user?.id);
  const isSignedIn = !authLoading && !!user;

  // Auto-link drug names in paragraph text (first occurrence of each drug only)
  const markdownComponents = useMemo(() => {
    const linked = new Set();
    return {
      p: ({ children }) => {
        const processNode = (node) => {
          if (typeof node !== 'string') return node;
          const parts = [];
          let lastIndex = 0;
          let match;
          drugPattern.lastIndex = 0;
          while ((match = drugPattern.exec(node)) !== null) {
            const slug = drugLookup[match[1].toLowerCase()];
            if (!slug || linked.has(slug)) continue;
            linked.add(slug);
            if (match.index > lastIndex) parts.push(node.slice(lastIndex, match.index));
            parts.push(
              <Link key={`drug-${slug}-${match.index}`} href={`/drugs/${slug}`} className="text-purple font-medium hover:underline">
                {match[1]}
              </Link>
            );
            lastIndex = match.index + match[0].length;
          }
          if (parts.length === 0) return node;
          if (lastIndex < node.length) parts.push(node.slice(lastIndex));
          return parts;
        };
        const processed = Array.isArray(children)
          ? children.map((child) => processNode(child))
          : processNode(children);
        return <p>{processed}</p>;
      },
    };
  }, []);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text || text.length < 10) return;
    if (articleRef.current && articleRef.current.contains(sel.anchorNode)) {
      setQuotedText(text.length > 280 ? text.slice(0, 280) + '\u2026' : text);
    }
  }, []);

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    await deletePost(post.id);
    router.push('/resources');
  };

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
          url={`https://taper.community/resources/blog/${post.slug}`}
          title={post.title}
          text={`${post.title} — TaperCommunity`}
        />
      </div>

      {/* Article body — track text selection for quoting (signed-in only) */}
      <div
        ref={articleRef}
        onMouseUp={isSignedIn ? handleMouseUp : undefined}
        className="prose prose-sm max-w-none text-text-muted prose-headings:font-serif prose-headings:text-foreground prose-a:text-purple prose-strong:text-foreground prose-img:rounded-xl"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {post.body}
        </ReactMarkdown>
      </div>

      <hr style={{ borderColor: 'var(--border-subtle)' }} />

      {/* Comments + inline form */}
      <BlogCommentSection blogPostId={post.id} quotedText={quotedText} onQuoteUsed={() => setQuotedText('')} />
    </div>
  );
}
