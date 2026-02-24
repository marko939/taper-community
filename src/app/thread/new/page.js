'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import NewThreadForm from '@/components/forums/NewThreadForm';
import { PageLoading } from '@/components/shared/LoadingSpinner';
import { GENERAL_FORUMS, FORUM_CATEGORY_ORDER } from '@/lib/forumCategories';

function NewThreadContent() {
  const { user, loading: authLoading } = useRequireAuth();
  const [forums, setForums] = useState([]);
  const [selectedForums, setSelectedForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drugDropdownOpen, setDrugDropdownOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const { data } = await supabase
          .from('forums')
          .select('id, name, slug, drug_slug, category')
          .order('category')
          .order('name');
        setForums(data || []);

        const forumId = searchParams.get('forum');
        if (forumId) setSelectedForums([forumId]);
      } catch (err) {
        console.error('[NewThread] fetch forums error:', err);
      }
      setLoading(false);
    };
    fetchForums();
  }, []);

  if (authLoading || loading) return <PageLoading />;

  // Build set of GENERAL_FORUMS slugs for filtering
  const generalSlugs = new Set(GENERAL_FORUMS.map((f) => f.slug));

  // Match DB forums to GENERAL_FORUMS by slug
  const grouped = {};
  for (const gf of GENERAL_FORUMS) {
    const dbForum = forums.find((f) => f.slug === gf.slug);
    if (!dbForum) continue;
    if (!grouped[gf.category]) grouped[gf.category] = [];
    grouped[gf.category].push({
      ...dbForum,
      displayName: gf.name,
    });
  }

  // Drug-specific forums = everything with a drug_slug (not in general forums)
  const drugForums = forums
    .filter((f) => f.drug_slug && !generalSlugs.has(f.slug))
    .sort((a, b) => a.name.localeCompare(b.name));

  const toggleForum = (forumId) => {
    setSelectedForums((prev) =>
      prev.includes(forumId) ? prev.filter((id) => id !== forumId) : [...prev, forumId]
    );
  };

  const handleSubmit = async ({ title, body, tags }) => {
    if (selectedForums.length === 0) throw new Error('Please select at least one community.');

    // Wrap the entire creation in a timeout so it never hangs forever
    const createThread = async () => {
      const { data: thread, error } = await supabase
        .from('threads')
        .insert({
          forum_id: selectedForums[0],
          user_id: user.id,
          title,
          body,
          tags,
        })
        .select('id')
        .maybeSingle();

      if (error) {
        console.error('[NewThread] insert error:', error);
        throw new Error(error.message || 'Failed to create thread.');
      }
      if (!thread) {
        throw new Error('Thread was not created. Please try again.');
      }

      // Link thread to ALL selected forums via junction table (best-effort)
      const forumLinks = selectedForums.map((forumId) => ({
        thread_id: thread.id,
        forum_id: forumId,
      }));
      try { await supabase.from('thread_forums').insert(forumLinks); } catch {}

      return thread;
    };

    let thread;
    try {
      thread = await Promise.race([
        createThread(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
      ]);
    } catch (err) {
      if (err?.message === 'timeout') {
        throw new Error('Posting timed out. Please try again.');
      }
      throw err;
    }

    router.push(`/thread/${thread.id}`);
  };

  // Selected drug forums for display
  const selectedDrugForums = drugForums.filter((f) => selectedForums.includes(f.id));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/forums" className="text-sm text-text-subtle hover:text-foreground">
          &larr; Back to Forums
        </Link>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-foreground">Start a New Thread</h1>
        <p className="mt-1 text-sm text-text-muted">
          Select one or more communities to post in.
        </p>
      </div>

      {/* Community tagger */}
      <div className="glass-panel p-5">
        <label className="mb-3 block text-sm font-semibold text-foreground">
          Post to Communities
          {selectedForums.length > 0 && (
            <span className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: 'var(--purple-pale)', color: 'var(--purple)' }}>
              {selectedForums.length} selected
            </span>
          )}
        </label>

        <div className="space-y-4">
          {FORUM_CATEGORY_ORDER.filter(({ key }) => key !== 'drug').map(({ key, label }) => {
            const catForums = grouped[key];
            if (!catForums || catForums.length === 0) return null;
            return (
              <div key={key}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-subtle">
                  {label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {catForums.map((forum) => {
                    const isSelected = selectedForums.includes(forum.id);
                    return (
                      <button
                        key={forum.id}
                        type="button"
                        onClick={() => toggleForum(forum.id)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
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
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-subtle">
                Drug-Specific Forums
              </p>

              {/* Show selected drug pills */}
              {selectedDrugForums.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {selectedDrugForums.map((forum) => (
                    <button
                      key={forum.id}
                      type="button"
                      onClick={() => toggleForum(forum.id)}
                      className="rounded-full border border-purple bg-purple/10 px-3 py-1.5 text-xs font-medium text-purple transition"
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
                  className="flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition hover:border-purple-pale"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                >
                  <span>Select a medication...</span>
                  <svg
                    className={`h-4 w-4 transition ${drugDropdownOpen ? 'rotate-180' : ''}`}
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
                    className="absolute left-0 right-0 z-10 mt-1 max-h-60 overflow-y-auto rounded-xl border shadow-lg"
                    style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
                  >
                    {drugForums.map((forum) => {
                      const isSelected = selectedForums.includes(forum.id);
                      return (
                        <button
                          key={forum.id}
                          type="button"
                          onClick={() => {
                            toggleForum(forum.id);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-purple-ghost/50"
                          style={{ color: isSelected ? 'var(--purple)' : 'var(--foreground)' }}
                        >
                          {isSelected && (
                            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
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

      <NewThreadForm forumId={selectedForums[0] || ''} onSubmit={handleSubmit} disabled={selectedForums.length === 0} />
    </div>
  );
}

export default function NewThreadPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NewThreadContent />
    </Suspense>
  );
}
