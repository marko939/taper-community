'use client';

import { useEffect } from 'react';
import { useBlogStore } from '@/stores/blogStore';
import BlogCommentList from './BlogCommentList';
import BlogCommentForm from './BlogCommentForm';

export default function BlogCommentSection({ blogPostId, quotedText, onQuoteUsed }) {
  const commentData = useBlogStore((s) => s.comments[blogPostId]);
  const commentsLoading = useBlogStore((s) => s.commentsLoading);
  const fetchComments = useBlogStore((s) => s.fetchComments);

  const comments = commentData?.items || [];
  const totalCount = commentData?.totalCount || 0;

  useEffect(() => {
    if (blogPostId) fetchComments(blogPostId);
  }, [blogPostId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        {commentsLoading ? 'Comments' : `${totalCount} ${totalCount === 1 ? 'Comment' : 'Comments'}`}
      </h2>

      {commentsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple border-t-transparent" />
        </div>
      ) : (
        <BlogCommentList comments={comments} blogPostId={blogPostId} />
      )}

      {/* Inline quote preview */}
      {quotedText && (
        <div
          className="flex items-start gap-2 rounded-lg px-3 py-2 text-xs"
          style={{ background: 'var(--purple-ghost)', color: 'var(--text-muted)' }}
        >
          <span className="shrink-0 font-semibold" style={{ color: 'var(--purple)' }}>Quoting:</span>
          <span className="line-clamp-2 italic">&ldquo;{quotedText}&rdquo;</span>
          <button
            onClick={onQuoteUsed}
            className="ml-auto shrink-0 text-text-subtle hover:text-foreground"
            aria-label="Remove quote"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <BlogCommentForm blogPostId={blogPostId} quotedText={quotedText} onQuoteUsed={onQuoteUsed} />
    </div>
  );
}
