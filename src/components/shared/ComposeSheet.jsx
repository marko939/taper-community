'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ensureSession } from '@/lib/ensureSession';
import { useAuthStore } from '@/stores/authStore';
import { useForumStore } from '@/stores/forumStore';
import { fireAndForget } from '@/lib/fireAndForget';
import { THREAD_TAGS } from '@/lib/constants';
import EmojiPickerButton from '@/components/shared/EmojiPickerButton';
import FormattingToolbar, { makeBulletKeyHandler, makeImagePasteHandler, makeImageDropHandler, preventDefaultDrag } from '@/components/shared/FormattingToolbar';

export default function ComposeSheet({ onClose }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const forums = useForumStore((s) => s.forums);
  const fetchForums = useForumStore((s) => s.fetchForums);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedForum, setSelectedForum] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bodyRef = useRef(null);
  const sheetRef = useRef(null);
  const [imgUploading, setImgUploading] = useState(false);
  const bulletKeyHandler = makeBulletKeyHandler(bodyRef, setBody);
  const bodyValRef = useRef(body);
  bodyValRef.current = body;
  const handlePaste = useCallback(makeImagePasteHandler(bodyRef, () => bodyValRef.current, setBody, setImgUploading), []);
  const handleDrop = useCallback(makeImageDropHandler(bodyRef, () => bodyValRef.current, setBody, setImgUploading), []);

  // Swipe-to-dismiss state
  const touchStartY = useRef(0);
  const translateY = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    fetchForums();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
    setDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0) {
      translateY.current = dy;
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${dy}px)`;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setDragging(false);
    if (translateY.current > 120) {
      onClose();
    } else {
      if (sheetRef.current) {
        sheetRef.current.style.transform = 'translateY(0)';
        sheetRef.current.style.transition = 'transform 0.2s ease-out';
        setTimeout(() => {
          if (sheetRef.current) sheetRef.current.style.transition = '';
        }, 200);
      }
    }
    translateY.current = 0;
  }, [onClose]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim() || !selectedForum || loading) return;
    setLoading(true);
    setError(null);

    try {
      // 8-second hard timeout — prevents infinite "Posting..." spinner
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out. Please try again.')), 8000)
      );

      const doSubmit = async () => {
        await ensureSession();
        const supabase = createClient();

        const { data: thread, error: insertErr } = await supabase
          .from('threads')
          .insert({
            title: title.trim(),
            body: body.trim(),
            tags: selectedTags,
            user_id: user.id,
          })
          .select()
          .single();

        if (insertErr) throw insertErr;

        // Link thread to forum
        fireAndForget('compose-link-forum', () =>
          supabase.from('thread_forums').insert({ thread_id: thread.id, forum_id: selectedForum })
        );

        useForumStore.getState().invalidate();
        onClose();
        router.push(`/thread/${thread.id}`);
      };

      await Promise.race([doSubmit(), timeout]);
    } catch (err) {
      console.error('[ComposeSheet] submit error:', err);
      setError(err.message || 'Failed to create thread.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl"
        style={{
          background: 'var(--surface-strong)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex items-center justify-center py-3"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="h-1 w-10 rounded-full" style={{ background: 'var(--border-subtle)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={onClose} className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Cancel
          </button>
          <h3 className="text-base font-semibold text-foreground">New Thread</h3>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !body.trim() || !selectedForum || loading}
            className="rounded-lg px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-40 active:scale-95"
            style={{ background: 'var(--purple)' }}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>

        {/* Form body — scrollable */}
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Forum picker */}
          <select
            value={selectedForum}
            onChange={(e) => setSelectedForum(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)', color: 'var(--foreground)' }}
          >
            <option value="">Select a forum...</option>
            {forums.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Thread title"
            className="w-full rounded-xl border px-4 py-3 text-sm font-medium"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)', color: 'var(--foreground)' }}
          />

          {/* Body */}
          <div>
            <FormattingToolbar textareaRef={bodyRef} value={body} onChange={setBody} />
            <textarea
              ref={bodyRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={bulletKeyHandler}
              onPaste={handlePaste}
              onDrop={handleDrop}
              onDragOver={preventDefaultDrag}
              placeholder="What's on your mind?"
              rows={6}
              className="mt-1 w-full resize-none rounded-xl border px-4 py-3 text-sm"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)', color: 'var(--foreground)' }}
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {THREAD_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition active:scale-95"
                style={{
                  background: selectedTags.includes(tag) ? 'var(--purple)' : 'var(--purple-ghost)',
                  color: selectedTags.includes(tag) ? '#fff' : 'var(--purple)',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
