'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { THREAD_TAGS } from '@/lib/constants';
import { GENERAL_FORUMS, FORUM_CATEGORY_ORDER } from '@/lib/forumCategories';

export default function QuickPost({ user, profile }) {
  const [forums, setForums] = useState([]);
  const [selectedForums, setSelectedForums] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [forumsLoading, setForumsLoading] = useState(true);
  const [success, setSuccess] = useState(null); // { id } on success
  const [error, setError] = useState('');
  const [drugDropdownOpen, setDrugDropdownOpen] = useState(false);

  const supabase = createClient();
  const isFirstPost = !profile?.post_count;

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const { data } = await supabase
          .from('forums')
          .select('id, name, slug, drug_slug, category')
          .order('category')
          .order('name');
        setForums(data || []);

        // Auto-select Introductions for first-time posters
        if (isFirstPost && data) {
          const introForum = data.find((f) => f.slug === 'introductions');
          if (introForum) setSelectedForums([introForum.id]);
        }
      } catch (err) {
        console.error('[QuickPost] fetch forums error:', err);
      }
      setForumsLoading(false);
    };
    fetchForums();
  }, []);

  // Build general forums grouped by category
  const generalSlugs = new Set(GENERAL_FORUMS.map((f) => f.slug));
  const grouped = {};
  for (const gf of GENERAL_FORUMS) {
    const dbForum = forums.find((f) => f.slug === gf.slug);
    if (!dbForum) continue;
    if (!grouped[gf.category]) grouped[gf.category] = [];
    grouped[gf.category].push({ ...dbForum, displayName: gf.name });
  }

  // Drug-specific forums
  const drugForums = forums
    .filter((f) => f.drug_slug && !generalSlugs.has(f.slug))
    .sort((a, b) => a.name.localeCompare(b.name));

  const selectedDrugForums = drugForums.filter((f) => selectedForums.includes(f.id));

  const toggleForum = (forumId) => {
    setSelectedForums((prev) =>
      prev.includes(forumId) ? prev.filter((id) => id !== forumId) : [...prev, forumId]
    );
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || selectedForums.length === 0 || loading) return;

    setLoading(true);
    setError('');
    try {
      const createThread = async () => {
        const result = await supabase
          .from('threads')
          .insert({
            forum_id: selectedForums[0],
            user_id: user.id,
            title: title.trim(),
            body: body.trim(),
            tags: selectedTags,
          })
          .select('id')
          .maybeSingle();

        if (!result || result.error || !result.data) {
          throw new Error(result?.error?.message || 'Failed to create post. Please try again.');
        }

        // Link thread to all selected forums (best-effort)
        const forumLinks = selectedForums.map((forumId) => ({
          thread_id: result.data.id,
          forum_id: forumId,
        }));
        await supabase.from('thread_forums').insert(forumLinks).catch(() => {});

        return result.data;
      };

      const thread = await Promise.race([
        createThread(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
      ]);

      // Reset form and show success
      setTitle('');
      setBody('');
      setSelectedTags([]);
      setSuccess({ id: thread.id });
    } catch (err) {
      if (err?.message === 'timeout') {
        setError('Posting is taking too long. Please check your connection and try again.');
      } else {
        setError(err?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (forumsLoading) {
    return (
      <div className="h-32 animate-pulse rounded-xl" style={{ background: 'var(--surface-glass)' }} />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Success message */}
      {success && (
        <div
          className="flex items-center justify-between rounded-xl border px-4 py-3"
          style={{ borderColor: 'var(--teal)', background: 'rgba(46,196,182,0.08)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--teal)' }}>
            Post created!
          </p>
          <Link
            href={`/thread/${success.id}`}
            className="text-sm font-semibold no-underline"
            style={{ color: 'var(--teal)' }}
          >
            View post &rarr;
          </Link>
        </div>
      )}

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={isFirstPost ? "Hi, I'm..." : "What's on your mind?"}
        className="input"
        required
      />

      {/* Body */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={
          isFirstPost
            ? 'Tell us about yourself and your tapering journey...'
            : 'Share your experience, question, or thoughts...'
        }
        rows={4}
        className="textarea"
        required
      />

      {/* Tags */}
      <div>
        <span className="mb-2 block text-xs font-semibold text-text-subtle">Tags</span>
        <div className="flex flex-wrap gap-1.5">
          {THREAD_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
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

      {/* Forum selector */}
      <div>
        <span className="mb-2 block text-xs font-semibold text-text-subtle">
          Post to
          {selectedForums.length > 0 && (
            <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}>
              {selectedForums.length}
            </span>
          )}
        </span>

        <div className="space-y-3">
          {FORUM_CATEGORY_ORDER.filter(({ key }) => key !== 'drug').map(({ key, label }) => {
            const catForums = grouped[key];
            if (!catForums || catForums.length === 0) return null;
            return (
              <div key={key}>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-subtle">
                  {label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {catForums.map((forum) => {
                    const isSelected = selectedForums.includes(forum.id);
                    return (
                      <button
                        key={forum.id}
                        type="button"
                        onClick={() => toggleForum(forum.id)}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                          isSelected
                            ? 'border-purple bg-purple/10 text-purple'
                            : 'border-border-subtle text-text-muted hover:border-purple-pale hover:text-purple'
                        }`}
                      >
                        {forum.displayName}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Drug-specific dropdown */}
          {drugForums.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-subtle">
                Drug-Specific
              </p>

              {selectedDrugForums.length > 0 && (
                <div className="mb-1.5 flex flex-wrap gap-1.5">
                  {selectedDrugForums.map((forum) => (
                    <button
                      key={forum.id}
                      type="button"
                      onClick={() => toggleForum(forum.id)}
                      className="rounded-full border border-purple bg-purple/10 px-2.5 py-1 text-[11px] font-medium text-purple transition"
                    >
                      {forum.name} &times;
                    </button>
                  ))}
                </div>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDrugDropdownOpen(!drugDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs transition hover:border-purple-pale"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                >
                  <span>Select a medication...</span>
                  <svg
                    className={`h-3.5 w-3.5 transition ${drugDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {drugDropdownOpen && (
                  <div
                    className="absolute left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border shadow-lg"
                    style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
                  >
                    {drugForums.map((forum) => {
                      const isSelected = selectedForums.includes(forum.id);
                      return (
                        <button
                          key={forum.id}
                          type="button"
                          onClick={() => toggleForum(forum.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-purple-ghost/50"
                          style={{ color: isSelected ? 'var(--purple)' : 'var(--foreground)' }}
                        >
                          {isSelected && (
                            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                          <span className={isSelected ? 'font-medium' : ''}>{forum.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between">
        <Link href="/thread/new" className="text-xs text-text-subtle hover:text-foreground no-underline">
          Full editor &rarr;
        </Link>
        <button
          type="submit"
          disabled={loading || !title.trim() || !body.trim() || selectedForums.length === 0}
          className="btn btn-primary text-sm disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
