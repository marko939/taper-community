'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useBlogStore } from '@/stores/blogStore';
import EmojiPickerButton from '@/components/shared/EmojiPickerButton';
import FormattingToolbar, { makeBulletKeyHandler } from '@/components/shared/FormattingToolbar';

export default function BlogCommentForm({ blogPostId }) {
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

    try {
      const result = await addComment(blogPostId, body);
      if (result) setBody('');
      else setError('Comment could not be posted. Please try again.');
    } catch (err) {
      setError(err?.message || 'Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Leave a Comment</h3>
      <FormattingToolbar textareaRef={textareaRef} value={body} onChange={setBody} />
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={bulletKeyHandler}
        placeholder="Share your thoughts on this article..."
        rows={3}
        className="textarea rounded-t-none"
        required
      />
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}
      <div className="mt-3 flex items-center justify-end gap-2">
        <EmojiPickerButton textareaRef={textareaRef} value={body} onChange={setBody} />
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="btn btn-primary disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}
