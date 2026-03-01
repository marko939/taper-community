'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useThreadStore } from '@/stores/threadStore';
import EmojiPickerButton from '@/components/shared/EmojiPickerButton';
import FormattingToolbar, { makeBulletKeyHandler } from '@/components/shared/FormattingToolbar';

export default function ReplyForm({ threadId }) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);
  const bulletKeyHandler = makeBulletKeyHandler(textareaRef, setBody);
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const addReply = useThreadStore((s) => s.addReply);
  const pendingQuote = useThreadStore((s) => s.pendingQuote);
  const clearQuote = useThreadStore((s) => s.clearQuote);

  // Handle incoming quotes — always append to the end
  useEffect(() => {
    if (pendingQuote) {
      setBody((prev) => {
        const trimmed = prev.trimEnd();
        const separator = trimmed.length > 0 ? '\n\n' : '';
        return trimmed + separator + pendingQuote;
      });
      clearQuote();
      // Scroll form into view, focus, and move cursor to end
      requestAnimationFrame(() => {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.value.length;
          textareaRef.current.selectionEnd = textareaRef.current.value.length;
          textareaRef.current.focus();
        }
      });
    }
  }, [pendingQuote, clearQuote]);

  if (!authLoading && !user) {
    return (
      <div className="card text-center">
        <p className="text-text-muted">
          <Link href="/auth/signin" className="font-medium text-accent-blue hover:underline">Sign in</Link> to reply to this thread.
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
      const result = await addReply(threadId, body);
      if (result) {
        setBody('');
      } else {
        setError('Reply could not be posted. Please try again.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to post reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Write a Reply</h3>
      <FormattingToolbar
        textareaRef={textareaRef}
        value={body}
        onChange={setBody}
      />
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={bulletKeyHandler}
        placeholder="Share your thoughts or experience..."
        rows={4}
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
          {loading ? 'Posting...' : 'Post Reply'}
        </button>
      </div>
    </form>
  );
}
