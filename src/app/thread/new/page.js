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
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const fetchForums = async () => {
      const { data } = await supabase
        .from('forums')
        .select('id, name, drug_slug, category')
        .order('category')
        .order('name');
      setForums(data || []);

      const forumId = searchParams.get('forum');
      if (forumId) setSelectedForums([forumId]);

      setLoading(false);
    };
    fetchForums();
  }, []);

  if (authLoading || loading) return <PageLoading />;

  // Build a slug→display name map from GENERAL_FORUMS
  const displayNameBySlug = {};
  GENERAL_FORUMS.forEach((f) => { displayNameBySlug[f.slug] = f.name; });

  // Group forums by category, using GENERAL_FORUMS for display names
  const grouped = {};
  for (const forum of forums) {
    const cat = forum.category;
    // Normalize legacy categories
    const normalizedCat = cat === 'general' ? 'community' : cat === 'resources' ? 'research' : cat === 'start' ? 'community' : cat;
    if (!grouped[normalizedCat]) grouped[normalizedCat] = [];
    grouped[normalizedCat].push({
      ...forum,
      displayName: displayNameBySlug[forum.slug] || forum.name,
    });
  }

  const toggleForum = (forumId) => {
    setSelectedForums((prev) =>
      prev.includes(forumId) ? prev.filter((id) => id !== forumId) : [...prev, forumId]
    );
  };

  const handleSubmit = async ({ title, body, tags }) => {
    if (selectedForums.length === 0) return;

    // Insert a thread for each selected forum (cross-posting)
    const insertPromises = selectedForums.map((forumId) =>
      supabase
        .from('threads')
        .insert({
          forum_id: forumId,
          user_id: user.id,
          title,
          body,
          tags,
        })
        .select('id')
        .single()
    );

    const results = await Promise.all(insertPromises);
    const firstSuccess = results.find((r) => !r.error && r.data);
    if (firstSuccess) {
      router.push(`/thread/${firstSuccess.data.id}`);
    }
  };

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
          {FORUM_CATEGORY_ORDER.map(({ key, label }) => {
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
