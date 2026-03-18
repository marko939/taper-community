'use client';

import { useState, useRef, useCallback, useEffect, memo } from 'react';
import Link from 'next/link';
import Avatar from '@/components/shared/Avatar';
import { PeerAdvisorBadge, StaffBadge } from '@/components/shared/Badge';
import VoteButton from '@/components/shared/VoteButton';
import DrugSignature from '@/components/shared/DrugSignature';
import { useAuthStore } from '@/stores/authStore';
import { useThreadStore } from '@/stores/threadStore';
import { ADMIN_USER_ID, isMod } from '@/lib/blog';
import { renderBodyWithQuotes } from '@/lib/renderQuotes';
import FollowButton from '@/components/shared/FollowButton';

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function ReplyCard({ reply, threadId }) {
  const currentUser = useAuthStore((s) => s.user);
  const editReply = useThreadStore((s) => s.editReply);
  const deleteReply = useThreadStore((s) => s.deleteReply);

  const isOwner = currentUser?.id === reply.user_id;
  const isAdmin = isMod(currentUser?.id);
  const canModify = isOwner || isAdmin;

  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(reply.body);
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const displayName = reply.profiles?.display_name || 'Anonymous';

  const handleEdit = async () => {
    if (!editBody.trim()) return;
    setEditLoading(true);
    const ok = await editReply(threadId, reply.id, editBody);
    if (ok) setEditing(false);
    setEditLoading(false);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    await deleteReply(threadId, reply.id);
    setDeleteLoading(false);
  };

  return (
    <div id={`reply-${reply.id}`} className="card">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <Avatar name={displayName} avatarUrl={reply.profiles?.avatar_url} size="sm" foundingMember={reply.profiles?.is_founding_member} />
          <Link href={`/profile/${reply.user_id}`} className="font-semibold text-foreground no-underline hover:text-accent-blue">
            {displayName}
          </Link>
          {isMod(reply.user_id) && <StaffBadge />}
          {reply.profiles?.is_peer_advisor && <PeerAdvisorBadge />}
          <FollowButton targetUserId={reply.user_id} />
          {currentUser && currentUser.id !== reply.user_id && reply.user_id === ADMIN_USER_ID && (
            <Link
              href={`/messages?to=${reply.user_id}`}
              className="text-text-subtle transition hover:text-purple"
              title="Send message"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </Link>
          )}
          <span className="text-xs text-text-subtle">{timeAgo(reply.created_at)}</span>
        </div>

        {reply.profiles?.drug && (
          <p className="mt-1 text-xs text-text-subtle">
            {reply.profiles.drug} &middot; {reply.profiles.taper_stage}
          </p>
        )}

        {editing ? (
          <div className="mt-3 space-y-2">
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={4}
              className="textarea"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                disabled={editLoading || !editBody.trim()}
                className="btn btn-primary text-xs disabled:opacity-50"
              >
                {editLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => { setEditing(false); setEditBody(reply.body); }}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium transition"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text-muted" data-quotable data-author={displayName}>
              {renderBodyWithQuotes(reply.body)}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <VoteButton type="reply" targetId={reply.id} initialScore={reply.vote_score || 0} />
              {canModify && (
                <div className="ml-auto flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setEditBody(reply.body); setEditing(true); }}
                    className="rounded px-1.5 py-0.5 text-[11px] text-text-subtle transition hover:bg-purple-ghost/50 hover:text-purple"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded px-1.5 py-0.5 text-[11px] text-text-subtle transition hover:bg-red-50 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {showDeleteConfirm && (
              <div
                className="mt-3 flex items-center justify-between rounded-xl border px-4 py-3"
                style={{ borderColor: 'var(--border-subtle)', background: 'rgba(239,68,68,0.05)' }}
              >
                <p className="text-sm text-red-500">Delete this reply?</p>
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
          </>
        )}

        <DrugSignature signature={reply.profiles?.drug_signature} />
      </div>
    </div>
  );
}

const MemoReplyCard = memo(ReplyCard);

export default function ReplyList({ replies = [], threadId, hasMore = false, totalCount, onLoadMore }) {
  const loadingMore = useRef(false);
  const sentinelRef = useRef(null);

  // Scroll to hash anchor (for notification deep-links)
  useEffect(() => {
    if (!replies.length || typeof window === 'undefined') return;
    if (!window.location.hash) return;

    const replyId = window.location.hash.replace('#reply-', '');
    requestAnimationFrame(() => {
      const el = document.getElementById(`reply-${replyId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-flash');
        setTimeout(() => el.classList.remove('highlight-flash'), 2000);
      }
    });
  }, [replies.length]);

  // IntersectionObserver for infinite scroll load-more
  useEffect(() => {
    if (!hasMore || !onLoadMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore.current) {
          loadingMore.current = true;
          Promise.resolve(onLoadMore()).finally(() => {
            loadingMore.current = false;
          });
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, replies.length]);

  if (replies.length === 0) return null;

  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <MemoReplyCard key={reply.id} reply={reply} threadId={threadId} />
      ))}

      {/* Load-more sentinel — triggers when scrolled into view */}
      {hasMore && <div ref={sentinelRef} className="h-1" />}

      {hasMore && onLoadMore && (
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={onLoadMore}
            className="rounded-xl px-6 py-2.5 text-sm font-medium transition active:scale-95"
            style={{ color: 'var(--purple)', border: '1px solid var(--border-subtle)' }}
          >
            Load more replies
            {totalCount != null && (
              <span className="ml-2 text-xs text-text-subtle">
                ({replies.length} of {totalCount})
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
