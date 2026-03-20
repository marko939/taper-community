'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useThreadStore } from '@/stores/threadStore';
import EmojiPickerButton from '@/components/shared/EmojiPickerButton';
import MentionAutocomplete from '@/components/shared/MentionAutocomplete';
import FormattingToolbar, { makeBulletKeyHandler, makeImagePasteHandler, makeImageDropHandler, preventDefaultDrag } from '@/components/shared/FormattingToolbar';

export default function ReplyForm({ threadId }) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const textareaRef = useRef(null);
  const [imgUploading, setImgUploading] = useState(false);
  const bulletKeyHandler = makeBulletKeyHandler(textareaRef, setBody);
  const bodyRef = useRef(body);
  bodyRef.current = body;
  const handlePaste = useCallback(makeImagePasteHandler(textareaRef, () => bodyRef.current, setBody, setImgUploading), []);
  const handleDrop = useCallback(makeImageDropHandler(textareaRef, () => bodyRef.current, setBody, setImgUploading), []);
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const addReply = useThreadStore((s) => s.addReply);
  const pendingQuote = useThreadStore((s) => s.pendingQuote);
  const clearQuote = useThreadStore((s) => s.clearQuote);

  // Handle incoming quotes — always append to the end
  const rafRef = useRef(null);
  useEffect(() => {
    if (pendingQuote) {
      setBody((prev) => {
        const trimmed = prev.trimEnd();
        const separator = trimmed.length > 0 ? '\n\n' : '';
        return trimmed + separator + pendingQuote;
      });
      clearQuote();
      setMobileExpanded(true);
      // Scroll form into view, focus, and move cursor to end
      rafRef.current = requestAnimationFrame(() => {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.value.length;
          textareaRef.current.selectionEnd = textareaRef.current.value.length;
          textareaRef.current.focus();
        }
      });
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
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

    // 8-second hard timeout — prevents infinite "Posting..." spinner
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. Please try again.')), 8000)
    );

    try {
      const result = await Promise.race([addReply(threadId, body), timeout]);
      if (result) {
        setBody('');
        setMobileExpanded(false);
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
    <>
      {/* Desktop: inline card (same as before) */}
      <form onSubmit={handleSubmit} className="card hidden lg:block">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Write a Reply</h3>
        <FormattingToolbar
          textareaRef={textareaRef}
          value={body}
          onChange={setBody}
        />
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={bulletKeyHandler}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={preventDefaultDrag}
            placeholder="Share your thoughts or experience..."
            rows={4}
            className="textarea rounded-t-none"
            required
          />
          <MentionAutocomplete textareaRef={textareaRef} value={body} onChange={setBody} />
        </div>
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

      {/* Mobile: sticky bottom bar */}
      <div
        className="fixed inset-x-0 z-40 border-t lg:hidden"
        style={{
          bottom: '56px', // above bottom nav
          background: 'var(--surface-strong)',
          borderColor: 'var(--border-subtle)',
          paddingBottom: mobileExpanded ? '0' : '0',
        }}
      >
        {!mobileExpanded ? (
          /* Collapsed: single tap target */
          <button
            onClick={() => { setMobileExpanded(true); setTimeout(() => textareaRef.current?.focus(), 100); }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-purple-ghost/50"
            style={{ minHeight: '48px' }}
          >
            <svg className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--purple)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            <span className="text-sm text-text-muted">Write a reply...</span>
          </button>
        ) : (
          /* Expanded: full form */
          <form onSubmit={handleSubmit} className="px-4 pb-2 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMobileExpanded(false)}
                className="text-xs font-medium active:opacity-70"
                style={{ color: 'var(--text-muted)' }}
              >
                Collapse
              </button>
              <button
                type="submit"
                disabled={loading || !body.trim()}
                className="rounded-lg px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-40 active:scale-95"
                style={{ background: 'var(--purple)' }}
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={bulletKeyHandler}
                onPaste={handlePaste}
                onDrop={handleDrop}
                onDragOver={preventDefaultDrag}
                placeholder="Share your thoughts or experience..."
                rows={3}
                className="textarea text-sm"
                required
              />
              <MentionAutocomplete textareaRef={textareaRef} value={body} onChange={setBody} />
            </div>
            {error && (
              <p className="mt-1 text-xs text-red-600">{error}</p>
            )}
            <div className="mt-1 flex items-center gap-2">
              <EmojiPickerButton textareaRef={textareaRef} value={body} onChange={setBody} />
            </div>
          </form>
        )}
      </div>
    </>
  );
}
