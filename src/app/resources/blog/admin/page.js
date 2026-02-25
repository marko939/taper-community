'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useBlogStore } from '@/stores/blogStore';
import { ADMIN_USER_ID, toSlug } from '@/lib/blog';

export default function BlogAdminPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    }>
      <BlogAdminContent />
    </Suspense>
  );
}

function BlogAdminContent() {
  const { user, loading: authLoading } = useAuth();
  const { posts, postsLoading, fetchPosts, createPost, updatePost, deletePost } = useBlogStore();
  const searchParams = useSearchParams();

  const [editing, setEditing] = useState(null); // null = list view, 'new' or post id
  const [form, setForm] = useState({ title: '', excerpt: '', body: '', cover_image_url: '', tags: '', published: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id === ADMIN_USER_ID) {
      fetchPosts(true);
    }
  }, [user, fetchPosts]);

  // Handle ?edit= query param — open editor for that post once posts are loaded
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && posts.length > 0 && !editing) {
      const post = posts.find((p) => p.id === editId);
      if (post) startEdit(post);
    }
  }, [searchParams, posts]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    );
  }

  if (!user || user.id !== ADMIN_USER_ID) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-foreground">Not authorized</p>
        <p className="mt-2 text-sm text-text-muted">You do not have permission to access this page.</p>
        <Link href="/resources" className="mt-4 inline-block text-sm text-purple hover:underline">
          Back to Resources
        </Link>
      </div>
    );
  }

  const resetForm = () => {
    setForm({ title: '', excerpt: '', body: '', cover_image_url: '', tags: '', published: false });
    setEditing(null);
  };

  const startEdit = (post) => {
    setForm({
      title: post.title,
      excerpt: post.excerpt || '',
      body: post.body || '',
      cover_image_url: post.cover_image_url || '',
      tags: (post.tags || []).join(', '),
      published: post.published,
    });
    setEditing(post.id);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      slug: toSlug(form.title),
      excerpt: form.excerpt.trim() || null,
      body: form.body,
      cover_image_url: form.cover_image_url.trim() || null,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      published: form.published,
    };

    if (editing === 'new') {
      payload.author_id = user.id;
      await createPost(payload);
    } else {
      await updatePost(editing, payload);
    }

    setSaving(false);
    resetForm();
    fetchPosts(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    await deletePost(id);
    fetchPosts(true);
  };

  // Editor view
  if (editing) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <button onClick={resetForm} className="inline-flex items-center gap-1.5 text-sm text-text-muted transition hover:text-purple">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to posts
        </button>

        <h1 className="font-serif text-2xl font-semibold text-foreground">
          {editing === 'new' ? 'New Post' : 'Edit Post'}
        </h1>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-purple"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
              placeholder="Post title"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">Excerpt</label>
            <input
              type="text"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full rounded-xl border px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-purple"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
              placeholder="Brief summary (optional)"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">Body</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={16}
              className="w-full rounded-xl border px-4 py-3 text-sm text-foreground outline-none transition focus:border-purple"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
              placeholder="Write your post content here..."
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">Cover Image URL</label>
            <input
              type="text"
              value={form.cover_image_url}
              onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
              className="w-full rounded-xl border px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-purple"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
              placeholder="https://... (optional)"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full rounded-xl border px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-purple"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
              placeholder="tapering, research, wellness (comma-separated)"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="h-4 w-4 rounded accent-purple"
            />
            Published
          </label>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.body.trim()}
              className="btn btn-primary text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : editing === 'new' ? 'Create Post' : 'Save Changes'}
            </button>
            <button onClick={resetForm} className="btn btn-secondary text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-eyebrow">Blog Admin</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-foreground">Manage Posts</h1>
        </div>
        <button onClick={() => setEditing('new')} className="btn btn-primary text-sm">
          New Post
        </button>
      </div>

      {postsLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}>
          <p className="text-sm text-text-muted">No posts yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between rounded-2xl border px-5 py-4 transition hover:border-purple"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{post.title}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      background: post.published ? 'var(--purple-pale)' : 'var(--border-subtle)',
                      color: post.published ? 'var(--purple)' : 'var(--text-subtle)',
                    }}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-text-subtle">
                  {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {post.tags?.length > 0 && ` · ${post.tags.join(', ')}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(post)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-purple transition hover:bg-purple-ghost"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-500 transition hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
