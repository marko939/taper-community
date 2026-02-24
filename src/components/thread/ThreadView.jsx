'use client';

import { useState } from 'react';
import Link from 'next/link';
import Avatar from '@/components/shared/Avatar';
import Badge, { PeerAdvisorBadge } from '@/components/shared/Badge';
import DrugSignature from '@/components/shared/DrugSignature';
import VoteButton from '@/components/shared/VoteButton';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase/client';
import { ADMIN_USER_ID } from '@/lib/blog';

export default function ThreadView({ thread }) {
  const { id, title, body, tags = [], view_count, vote_score, created_at, user_id, profiles, thread_forums = [], pinned } = thread;
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.id === ADMIN_USER_ID;
  const [isPinned, setIsPinned] = useState(!!pinned);
  const [pinLoading, setPinLoading] = useState(false);

  const togglePin = async () => {
    setPinLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('threads')
      .update({ pinned: !isPinned })
      .eq('id', id);
    if (!error) setIsPinned(!isPinned);
    setPinLoading(false);
  };
  const displayName = profiles?.display_name || 'Anonymous';
  const crossPostedForums = thread_forums
    .map((tf) => tf.forums)
    .filter(Boolean);

  return (
    <div className="card">
      <div className="flex gap-4">
        {/* Vote arrows */}
        <div className="shrink-0 pt-1">
          <VoteButton type="thread" targetId={id} initialScore={vote_score || 0} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Author sidebar */}
            <div className="shrink-0 lg:w-44">
              <div className="flex items-center gap-3 lg:flex-col lg:items-start">
                <Avatar name={displayName} avatarUrl={profiles?.avatar_url} size="lg" foundingMember={profiles?.is_founding_member} />
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${user_id}`} className="font-semibold text-foreground no-underline hover:text-accent-blue">
                      {displayName}
                    </Link>
                    {profiles?.is_peer_advisor && <PeerAdvisorBadge />}
                  </div>
                  {profiles?.drug && (
                    <p className="text-xs text-text-subtle">Tapering: {profiles.drug}</p>
                  )}
                  {profiles?.taper_stage && (
                    <p className="text-xs capitalize text-text-subtle">{profiles.taper_stage}</p>
                  )}
                  <p className="text-xs text-text-subtle">{profiles?.post_count || 0} posts</p>
                  {profiles?.location && (
                    <p className="text-xs text-text-subtle">{profiles.location}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={togglePin}
                    disabled={pinLoading}
                    className={`shrink-0 flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                      isPinned
                        ? 'border-purple bg-purple/10 text-purple'
                        : 'border-border-subtle text-text-subtle hover:border-purple-pale hover:text-purple'
                    }`}
                  >
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.828 3.414a2 2 0 012.828 0l1.93 1.93a2 2 0 010 2.828l-5.464 5.464a1 1 0 01-.414.257l-3.5 1a1 1 0 01-1.236-1.236l1-3.5a1 1 0 01.257-.414l5.464-5.464z" />
                    </svg>
                    {pinLoading ? '...' : isPinned ? 'Unpin' : 'Pin'}
                  </button>
                )}
              </div>

              <div className="mt-1 flex items-center gap-3 text-xs text-text-subtle">
                <span>{new Date(created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span>&middot;</span>
                <span>{view_count} views</span>
              </div>

              {crossPostedForums.length > 1 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-text-subtle">Posted in:</span>
                  {crossPostedForums.map((forum) => (
                    <Link
                      key={forum.slug}
                      href={`/forums/${forum.drug_slug || forum.slug}`}
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold no-underline transition hover:opacity-80"
                      style={{ background: 'var(--purple-ghost)', color: 'var(--purple)' }}
                    >
                      {forum.name}
                    </Link>
                  ))}
                </div>
              )}

              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              )}

              <div className="mt-6 max-w-none whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
                {body}
              </div>

              <DrugSignature signature={profiles?.drug_signature} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
