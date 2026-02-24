'use client';

import { useState } from 'react';
import { THREAD_TAGS } from '@/lib/constants';

export default function NewThreadForm({ forumId, onSubmit, disabled = false }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      await onSubmit({ title: title.trim(), body: body.trim(), tags: selectedTags });
    } catch (err) {
      console.error('[NewThreadForm] submit error:', err);
      setError(err.message || 'Failed to create thread. Please try again.');
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
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your experience, question, or thoughts..."
          rows={8}
          className="textarea"
          required
        />
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
