'use client';

import { useState, useRef, useCallback } from 'react';
import { THREAD_TAGS } from '@/lib/constants';
import EmojiPickerButton from '@/components/shared/EmojiPickerButton';
import MentionAutocomplete from '@/components/shared/MentionAutocomplete';
import FormattingToolbar, { makeBulletKeyHandler, makeImagePasteHandler, makeImageDropHandler, preventDefaultDrag } from '@/components/shared/FormattingToolbar';

export default function NewThreadForm({ forumId, onSubmit, disabled = false }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bodyRef = useRef(null);
  const [imgUploading, setImgUploading] = useState(false);
  const bulletKeyHandler = makeBulletKeyHandler(bodyRef, setBody);
  const bodyValRef = useRef(body);
  bodyValRef.current = body;
  const handlePaste = useCallback(makeImagePasteHandler(bodyRef, () => bodyValRef.current, setBody, setImgUploading), []);
  const handleDrop = useCallback(makeImageDropHandler(bodyRef, () => bodyValRef.current, setBody, setImgUploading), []);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      // 8-second hard timeout — prevents infinite "Posting..." spinner
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out. Please try again.')), 8000)
      );
      await Promise.race([
        onSubmit({ title: title.trim(), body: body.trim(), tags: selectedTags }),
        timeout,
      ]);
    } catch (err) {
      console.error('[NewThreadForm] submit error:', err);
      setError(err.message || 'Failed to create thread. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's on your mind?"
          className="input"
          required
        />
      </div>

      <div>
        <label htmlFor="body" className="mb-1.5 block text-sm font-medium text-foreground">
          Body
        </label>
        <FormattingToolbar
          textareaRef={bodyRef}
          value={body}
          onChange={setBody}
        />
        <div className="relative">
          <textarea
            id="body"
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={bulletKeyHandler}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={preventDefaultDrag}
            placeholder="Share your experience, question, or thoughts..."
            rows={8}
            className="textarea rounded-t-none"
            required
          />
          <MentionAutocomplete textareaRef={bodyRef} value={body} onChange={setBody} />
        </div>
        <div className="mt-1 flex justify-end">
          <EmojiPickerButton textareaRef={bodyRef} value={body} onChange={setBody} />
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-foreground">Tags</span>
        <div className="flex flex-wrap gap-2">
          {THREAD_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                selectedTags.includes(tag)
                  ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                  : 'border-border-subtle text-text-subtle hover:border-slate-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !title.trim() || !body.trim() || !forumId || disabled}
          className="btn btn-primary disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Thread'}
        </button>
      </div>
    </form>
  );
}
