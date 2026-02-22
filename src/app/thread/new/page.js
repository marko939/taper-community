'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import NewThreadForm from '@/components/forums/NewThreadForm';
import { PageLoading } from '@/components/shared/LoadingSpinner';

const CATEGORY_LABELS = {
  start: 'Getting Started',
  community: 'Community',
  general: 'Community',
  tapering: 'Tapering & Symptoms',
  lifestyle: 'Lifestyle & Wellness',
  drug: 'Drug-Specific',
  research: 'Research & News',
  resources: 'Research & News',
};

const CATEGORY_ORDER = ['start', 'community', 'tapering', 'lifestyle', 'drug', 'research'];

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

  // Group forums by category
  const grouped = {};
  for (const forum of forums) {
    const cat = forum.category;
    // Merge general into community, resources into research
    const normalizedCat = cat === 'general' ? 'community' : cat === 'resources' ? 'research' : cat;
    if (!grouped[normalizedCat]) grouped[normalizedCat] = [];
    grouped[normalizedCat].push(forum);
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
          {CATEGORY_ORDER.map((cat) => {
            const catForums = grouped[cat];
            if (!catForums || catForums.length === 0) return null;
            return (
              <div key={cat}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-subtle">
                  {CATEGORY_LABELS[cat]}
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
                        {forum.name}
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
