'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useBlogStore } from '@/stores/blogStore';
import { makeBulletKeyHandler } from '@/components/shared/FormattingToolbar';

export default function BlogCommentForm({ blogPostId, quotedText, onQuoteUsed }) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);
  const bulletKeyHandler = makeBulletKeyHandler(textareaRef, setBody);
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const addComment = useBlogStore((s) => s.addComment);

  if (!authLoading && !user) {
    return (
      <div className="card text-center">
        <p className="text-text-muted">
          <Link href="/auth/signin" className="font-medium text-accent-blue hover:underline">Sign in</Link> to join the discussion.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim() || loading) return;

    setLoading(true);
    setError('');

    // Prepend quoted text as a blockquote if present
    const fullBody = quotedText
      ? `> ${quotedText}\n\n${body}`
      : body;

    try {
      const result = await addComment(blogPostId, fullBody);
      if (result) {
        setBody('');
        if (onQuoteUsed) onQuoteUsed();
      } else {
        setError('Comment could not be posted. Please try again.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="min-w-0 flex-1">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={bulletKeyHandler}
          placeholder="Share your thoughts on this article..."
          rows={1}
          className="textarea w-full resize-none"
          style={{ maxHeight: '120px' }}
          onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
          required
        />
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || !body.trim()}
        className="btn btn-primary shrink-0 disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}
