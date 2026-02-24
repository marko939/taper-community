'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const isOwner = currentUser?.id === user_id;
  const canModify = isAdmin || isOwner;
  const router = useRouter();

  const [isPinned, setIsPinned] = useState(!!pinned);
  const [pinLoading, setPinLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editBody, setEditBody] = useState(body);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const supabase = createClient();

  const togglePin = async () => {
    setPinLoading(true);
    const { error } = await supabase
      .from('threads')
      .update({ pinned: !isPinned })
      .eq('id', id);
    if (!error) setIsPinned(!isPinned);
    setPinLoading(false);
  };

  const handleEdit = async () => {
    if (!editTitle.trim() || !editBody.trim()) return;
    setEditLoading(true);
    const { error } = await supabase
      .from('threads')
      .update({ title: editTitle.trim(), body: editBody.trim() })
      .eq('id', id);
    if (!error) {
      thread.title = editTitle.trim();
      thread.body = editBody.trim();
      setEditing(false);
    }
    setEditLoading(false);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    const { error } = await supabase
      .from('threads')
      .delete()
      .eq('id', id);
    if (!error) {
      router.push('/forums');
    } else {
      console.error('[ThreadView] delete error:', error);
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
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
              {editing ? (
                /* Edit mode */
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="input text-lg font-semibold"
                  />
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={8}
                    className="textarea"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleEdit}
                      disabled={editLoading || !editTitle.trim() || !editBody.trim()}
                      className="btn btn-primary text-sm disabled:opacity-50"
                    >
                      {editLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setEditTitle(title); setEditBody(body); }}
                      className="rounded-lg border px-3 py-1.5 text-sm font-medium transition"
                      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <>
                  <div className="flex items-start justify-between gap-3">
                    <h1 className="text-2xl font-semibold text-foreground">{editTitle}</h1>
                    {(isAdmin || canModify) && (
                      <div className="flex shrink-0 gap-1.5">
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={togglePin}
                            disabled={pinLoading}
                            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
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
                        <button
                          type="button"
                          onClick={() => setEditing(true)}
                          className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition border-border-subtle text-text-subtle hover:border-purple-pale hover:text-purple"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition border-border-subtle text-red-400 hover:border-red-300 hover:bg-red-50"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Delete confirmation */}
                  {showDeleteConfirm && (
                    <div
                      className="mt-3 flex items-center justify-between rounded-xl border px-4 py-3"
                      style={{ borderColor: 'var(--border-subtle)', background: 'rgba(239,68,68,0.05)' }}
                    >
                      <p className="text-sm text-red-500">Delete this thread permanently?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDelete}
                          disabled={deleteLoading}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-600"
                        >
                          {deleteLoading ? 'Deleting...' : 'Yes, delete'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

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
                    {editBody}
                  </div>

                  <DrugSignature signature={profiles?.drug_signature} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
