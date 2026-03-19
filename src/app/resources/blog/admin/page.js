'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/hooks/useAuth';
import { useBlogStore } from '@/stores/blogStore';
import { isPrimaryAdmin, toSlug } from '@/lib/blog';
import { createClient } from '@/lib/supabase/client';
import FormattingToolbar, { makeBulletKeyHandler } from '@/components/shared/FormattingToolbar';

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

const EMPTY_FORM = {
  title: '', excerpt: '', body: '', cover_image_url: '', tags: '',
  published: true, meta_description: '', slug_override: '',
};

const DRAFT_KEY = 'blog-admin-draft';

function saveDraftToStorage(form) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  } catch {}
}

function loadDraftFromStorage() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Only restore if there's meaningful content
    if (parsed.title || parsed.body) return parsed;
    return null;
  } catch {
    return null;
  }
}

function clearDraftFromStorage() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

/** Compress image client-side using canvas. Target ~800KB max. */
async function compressImage(file, maxWidth = 1600, quality = 0.82) {
  // Skip compression for GIFs (would lose animation) and small files
  if (file.type === 'image/gif' || file.size < 500_000) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // Compression didn't help — use original
            resolve(file);
          } else {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Fallback to original on error
    };
    img.src = url;
  });
}

function BlogAdminContent() {
  const { user, loading: authLoading } = useAuth();
  const { posts, postsLoading, fetchPosts, createPost, updatePost, deletePost } = useBlogStore();
  const searchParams = useSearchParams();

  const [editing, setEditing] = useState(null); // null = list view, 'new' or post id
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [draftRestored, setDraftRestored] = useState(false);
  const bodyRef = useRef(null);
  const coverInputRef = useRef(null);
  const autoSaveTimer = useRef(null);
  const bulletKeyHandler = makeBulletKeyHandler(bodyRef, (val) => setForm((f) => ({ ...f, body: val })));

  // Auto-save draft every 30 seconds while editing
  useEffect(() => {
    if (!editing) return;
    autoSaveTimer.current = setInterval(() => {
      saveDraftToStorage(form);
    }, 30_000);
    return () => clearInterval(autoSaveTimer.current);
  }, [editing, form]);

  // On mount, check for saved draft
  useEffect(() => {
    const draft = loadDraftFromStorage();
    if (draft && !editing) {
      setDraftRestored(true);
      // Don't auto-restore — show a prompt
    }
  }, []);

  const restoreDraft = () => {
    const draft = loadDraftFromStorage();
    if (draft) {
      setForm({ ...EMPTY_FORM, ...draft });
      setEditing('new');
      setDraftRestored(false);
    }
  };

  const dismissDraft = () => {
    clearDraftFromStorage();
    setDraftRestored(false);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setUploadProgress('Compressing image...');
    setSaveError(null);
    try {
      // user.id is already available from useAuth() — no session check needed.
      // The Supabase client handles storage auth via its internal token.
      const supabase = createClient();

      const compressed = await compressImage(file);
      const ext = compressed.type === 'image/jpeg' ? 'jpg' : file.name.split('.').pop();

      setUploadProgress('Uploading...');
      const path = `${user.id}/blog-cover-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('post-images')
        .upload(path, compressed, { contentType: compressed.type });
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(path);
      setForm((f) => ({ ...f, cover_image_url: publicUrl }));
      setUploadProgress('');
    } catch (err) {
      console.error('[blog-admin] cover upload error:', err);
      setUploadProgress('');
      setSaveError('Failed to upload image: ' + (err.message || 'Please try again.'));
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (isPrimaryAdmin(user?.id)) {
      fetchPosts(true);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle ?edit= or ?new=1 query params
  useEffect(() => {
    const editId = searchParams.get('edit');
    const isNew = searchParams.get('new');
    if (editId && posts.length > 0 && !editing) {
      const post = posts.find((p) => p.id === editId);
      if (post) startEdit(post);
    } else if (isNew && !editing) {
      setEditing('new');
    }
  }, [searchParams, posts]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    );
  }

  if (!user || !isPrimaryAdmin(user.id)) {
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
    setForm(EMPTY_FORM);
    setEditing(null);
    setSaveError(null);
    clearDraftFromStorage();
  };

  const startEdit = (post) => {
    setForm({
      title: post.title,
      excerpt: post.excerpt || '',
      body: post.body || '',
      cover_image_url: post.cover_image_url || '',
      tags: (post.tags || []).join(', '),
      published: post.published,
      meta_description: post.meta_description || '',
      slug_override: post.slug || '',
    });
    setEditing(post.id);
    setSaveError(null);
  };

  const generatedSlug = toSlug(form.title);
  const finalSlug = form.slug_override.trim() ? toSlug(form.slug_override) : generatedSlug;

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setSaveError(null);

    // Save draft before attempting — safety net
    saveDraftToStorage(form);

    const payload = {
      title: form.title.trim(),
      slug: finalSlug,
      excerpt: form.excerpt.trim() || null,
      body: form.body.trim() || '',
      cover_image_url: form.cover_image_url.trim() || null,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      published: form.published,
    };
    if (form.meta_description.trim()) {
      payload.meta_description = form.meta_description.trim();
    }

    try {
      let result;
      if (editing === 'new') {
        payload.author_id = user.id;
        result = await createPost(payload);
      } else {
        result = await updatePost(editing, payload);
      }

      // Success — clear form AND draft
      clearDraftFromStorage();
      setForm(EMPTY_FORM);
      setEditing(null);
      fetchPosts(true);
    } catch (err) {
      // Draft already saved to localStorage above — form stays intact
      setSaveError(err.message || 'Post failed to submit — your draft has been saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    await deletePost(id);
    fetchPosts(true);
  };

  const inputClass = 'w-full rounded-xl border px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-purple';
  const inputStyle = { borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' };

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

        {saveError && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {saveError}
          </div>
        )}

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              style={inputStyle}
              placeholder="Post title"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">Excerpt</label>
            <input
              type="text"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className={inputClass}
              style={inputStyle}
              placeholder="Brief summary shown on cards and social previews"
            />
          </div>

          {/* Body */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-semibold text-text-muted">Body</label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="rounded px-2 py-0.5 text-xs font-medium transition hover:bg-purple-ghost/50"
                style={{ color: 'var(--purple)' }}
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
            {showPreview ? (
              <div
                className="prose prose-sm max-w-none rounded-xl border px-4 py-3 text-foreground"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)', minHeight: '400px' }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.body || '*Nothing to preview*'}</ReactMarkdown>
              </div>
            ) : (
              <>
                <FormattingToolbar
                  textareaRef={bodyRef}
                  value={form.body}
                  onChange={(val) => setForm({ ...form, body: val })}
                />
                <textarea
                  ref={bodyRef}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  onKeyDown={bulletKeyHandler}
                  rows={16}
                  className="w-full rounded-b-xl rounded-t-none border px-4 py-3 text-sm text-foreground outline-none transition focus:border-purple"
                  style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
                  placeholder="Write your post content here... Use **bold** and *italic* formatting."
                />
              </>
            )}
          </div>

          {/* Cover Image */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">Cover Image</label>
            {form.cover_image_url && (
              <div className="relative mb-2 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)' }}>
                <img src={form.cover_image_url} alt="Cover preview" className="w-full max-h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, cover_image_url: '' })}
                  className="absolute top-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-[11px] font-medium text-white transition hover:bg-black/80"
                >
                  Remove
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                onChange={handleCoverUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:border-purple hover:text-purple disabled:opacity-50"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
              >
                {uploadingCover ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple border-t-transparent" />
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                )}
                {uploadingCover ? (uploadProgress || 'Uploading...') : 'Upload Image'}
              </button>
              <input
                type="text"
                value={form.cover_image_url}
                onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                className={inputClass + ' flex-1'}
                style={inputStyle}
                placeholder="or paste image URL"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className={inputClass}
              style={inputStyle}
              placeholder="tapering, research, wellness (comma-separated)"
            />
          </div>

          {/* ─── SEO Section ─── */}
          <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">SEO Settings</p>

            {/* Custom Slug */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-muted">URL Slug</label>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-xs text-text-subtle">/resources/blog/</span>
                <input
                  type="text"
                  value={form.slug_override}
                  onChange={(e) => setForm({ ...form, slug_override: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                  placeholder={generatedSlug || 'auto-generated-from-title'}
                />
              </div>
              {form.title && (
                <p className="mt-1 text-[11px] text-text-subtle">
                  Final URL: /resources/blog/<strong>{finalSlug}</strong>
                </p>
              )}
            </div>

            {/* Meta Description */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-muted">Meta Description</label>
              <textarea
                value={form.meta_description}
                onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                rows={3}
                className={inputClass}
                style={inputStyle}
                placeholder="155-character description for search engines and social sharing"
                maxLength={300}
              />
              <p className="mt-1 text-[11px] text-text-subtle">
                {form.meta_description.length}/155 characters
                {form.meta_description.length > 155 && (
                  <span className="text-rose-500 ml-1">(Google may truncate this)</span>
                )}
              </p>
            </div>
          </div>

          {/* Published toggle */}
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
              disabled={saving || !form.title.trim()}
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

      {/* Draft restoration banner */}
      {draftRestored && (
        <div
          className="flex items-center justify-between rounded-2xl border px-5 py-4"
          style={{ borderColor: 'var(--purple)', background: 'var(--purple-ghost)' }}
        >
          <p className="text-sm text-foreground">
            You have an unsaved draft. Want to continue editing?
          </p>
          <div className="flex gap-2">
            <button onClick={restoreDraft} className="btn btn-primary text-xs">
              Restore Draft
            </button>
            <button onClick={dismissDraft} className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted transition hover:text-foreground">
              Discard
            </button>
          </div>
        </div>
      )}

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
