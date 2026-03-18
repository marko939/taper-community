'use client';

import { useState } from 'react';
import Link from 'next/link';
import Avatar from '@/components/shared/Avatar';
import { PeerAdvisorBadge, StaffBadge } from '@/components/shared/Badge';
import { useAuthStore } from '@/stores/authStore';
import { useBlogStore } from '@/stores/blogStore';
import { isMod } from '@/lib/blog';

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

function CommentCard({ comment, blogPostId }) {
  const currentUser = useAuthStore((s) => s.user);
  const deleteComment = useBlogStore((s) => s.deleteComment);
  const editComment = useBlogStore((s) => s.editComment);
  const isOwner = currentUser?.id === comment.user_id;
  const isAdmin = isMod(currentUser?.id);
  const canDelete = isOwner || isAdmin;
  const canEdit = isOwner || isAdmin;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [editLoading, setEditLoading] = useState(false);

  const displayName = comment.profiles?.display_name || 'Anonymous';

  const handleDelete = async () => {
    setDeleteLoading(true);
    await deleteComment(blogPostId, comment.id);
    setDeleteLoading(false);
  };

  const handleEdit = async () => {
    if (!editBody.trim()) return;
    setEditLoading(true);
    const result = await editComment(blogPostId, comment.id, editBody);
    setEditLoading(false);
    if (result) setEditing(false);
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 text-sm">
        <Avatar name={displayName} avatarUrl={comment.profiles?.avatar_url} size="sm" foundingMember={comment.profiles?.is_founding_member} />
        <Link href={`/profile/${comment.user_id}`} className="font-semibold text-foreground no-underline hover:text-accent-blue">
          {displayName}
        </Link>
        {isMod(comment.user_id) && <StaffBadge />}
        {comment.profiles?.is_peer_advisor && <PeerAdvisorBadge />}
        <span className="text-xs text-text-subtle">{timeAgo(comment.created_at)}</span>
      </div>

      {comment.profiles?.drug && (
        <p className="mt-1 text-xs text-text-subtle">
          {comment.profiles.drug} &middot; {comment.profiles.taper_stage}
        </p>
      )}

      {editing ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={3}
            className="w-full rounded-xl border px-3 py-2 text-sm text-foreground outline-none transition focus:border-purple"
            style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              disabled={editLoading || !editBody.trim()}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--purple)' }}
            >
              {editLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => { setEditing(false); setEditBody(comment.body); }}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
          {comment.body}
        </div>
      )}

      {!editing && (canEdit || canDelete) && !showDeleteConfirm && (
        <div className="mt-2 flex justify-end gap-1">
          {canEdit && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded px-1.5 py-0.5 text-[11px] text-text-subtle transition hover:bg-purple-ghost hover:text-purple"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded px-1.5 py-0.5 text-[11px] text-text-subtle transition hover:bg-red-50 hover:text-red-500"
            >
              Delete
            </button>
          )}
        </div>
      )}

      {showDeleteConfirm && (
        <div
          className="mt-3 flex items-center justify-between rounded-xl border px-4 py-3"
          style={{ borderColor: 'var(--border-subtle)', background: 'rgba(239,68,68,0.05)' }}
        >
          <p className="text-sm text-red-500">Delete this comment?</p>
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
    </div>
  );
}

export default function BlogCommentList({ comments = [], blogPostId }) {
  if (comments.length === 0) return null;

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} blogPostId={blogPostId} />
      ))}
    </div>
  );
}
