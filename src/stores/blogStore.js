'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { ensureSession } from '@/lib/ensureSession';
import { fireAndForget } from '@/lib/fireAndForget';
import { PROFILE_FIELDS_BLOG_COMMENT } from '@/lib/supabase/queries';
import { getCurrentUserId } from './authStore';

const DB_TIMEOUT_MS = 15_000;

function withDbTimeout(promise) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Request timed out after 15 seconds. Please try again.')), DB_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export const useBlogStore = create((set, get) => ({
  posts: [],
  postsLoaded: false,
  postsLoading: false,
  currentPost: null,
  currentPostLoading: false,
  comments: {},        // keyed by blogPostId: { items, totalCount }
  commentsLoading: false,
  _abortControllers: {},

  cancelPending: (opName) => {
    const ctrl = get()._abortControllers[opName];
    if (ctrl) {
      ctrl.abort();
      set((state) => {
        const controllers = { ...state._abortControllers };
        delete controllers[opName];
        return { _abortControllers: controllers };
      });
    }
  },

  cancelAll: () => {
    const controllers = get()._abortControllers;
    for (const ctrl of Object.values(controllers)) {
      ctrl.abort();
    }
    set({ _abortControllers: {} });
  },

  pruneComments: (keepPostId) => {
    const comments = get().comments;
    const keys = Object.keys(comments);
    const MAX_CACHED = 5;
    if (keys.length <= MAX_CACHED) return;
    const pruned = { ...comments };
    const toRemove = keys.filter((k) => k !== keepPostId).slice(0, keys.length - MAX_CACHED);
    for (const k of toRemove) delete pruned[k];
    set({ comments: pruned });
  },

  invalidate: () => {
    set({ postsLoaded: false });
  },

  getSnapshot: () => {
    const s = get();
    return {
      postsCount: s.posts.length,
      postsLoaded: s.postsLoaded,
      commentKeys: Object.keys(s.comments).length,
      currentPost: s.currentPost?.slug ?? null,
      pendingAborts: Object.keys(s._abortControllers).length,
    };
  },

  fetchPosts: async (includeUnpublished = false) => {
    if (get().postsLoaded && !includeUnpublished) return get().posts;

    get().cancelPending('fetchPosts');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchPosts: controller },
      postsLoading: true,
    }));

    try {
      const supabase = createClient();
      let query = supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, body, cover_image_url, tags, published, meta_description, forum_thread_id, forum_slugs, created_at, updated_at')
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal);

      if (!includeUnpublished) {
        query = query.eq('published', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      const posts = data || [];
      set({ posts, postsLoaded: !includeUnpublished, postsLoading: false });
      return posts;
    } catch (err) {
      if (err.name === 'AbortError') return [];
      console.error('[blogStore] fetchPosts error:', err);
      set({ postsLoading: false });
      return [];
    }
  },

  fetchPost: async (slug) => {
    get().cancelPending('fetchPost');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchPost: controller },
      currentPostLoading: true,
    }));

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .abortSignal(controller.signal)
        .single();

      if (error) throw error;
      set({ currentPost: data, currentPostLoading: false });
      return data;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      console.error('[blogStore] fetchPost error:', err);
      set({ currentPost: null, currentPostLoading: false });
      return null;
    }
  },

  createPost: async (post) => {
    try {
      const supabase = createClient();
      let { data, error } = await withDbTimeout(
        supabase.from('blog_posts').insert(post).select().single()
      );

      // If slug conflict, append timestamp and retry once
      if (error && error.message?.includes('blog_posts_slug_key')) {
        post.slug = `${post.slug}-${Date.now()}`;
        ({ data, error } = await withDbTimeout(
          supabase.from('blog_posts').insert(post).select().single()
        ));
      }

      if (error) throw error;
      set({ postsLoaded: false });
      return data;
    } catch (err) {
      console.error('[blogStore] createPost error:', err);
      throw new Error(
        err.message?.includes('timed out')
          ? 'Post failed to submit — your draft has been saved. Please try again.'
          : 'Failed to create post: ' + (err.message || 'Unknown error')
      );
    }
  },

  updatePost: async (id, updates) => {
    try {
      const supabase = createClient();
      const { data, error } = await withDbTimeout(
        supabase
          .from('blog_posts')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
      );

      if (error) throw error;
      set({ postsLoaded: false });
      return data;
    } catch (err) {
      console.error('[blogStore] updatePost error:', err);
      throw new Error(
        err.message?.includes('timed out')
          ? 'Post failed to save — your draft has been saved. Please try again.'
          : 'Failed to update post: ' + (err.message || 'Unknown error')
      );
    }
  },

  deletePost: async (id) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((s) => ({ posts: s.posts.filter((p) => p.id !== id), postsLoaded: false }));
      return true;
    } catch (err) {
      console.error('[blogStore] deletePost error:', err);
      return false;
    }
  },

  fetchComments: async (blogPostId) => {
    get().cancelPending('fetchComments');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchComments: controller },
      commentsLoading: true,
    }));

    try {
      const supabase = createClient();
      const { data, count } = await supabase
        .from('blog_comments')
        .select(`*, ${PROFILE_FIELDS_BLOG_COMMENT}`, { count: 'exact' })
        .eq('blog_post_id', blogPostId)
        .order('created_at')
        .abortSignal(controller.signal);

      const rows = data || [];
      set((state) => ({
        comments: { ...state.comments, [blogPostId]: { items: rows, totalCount: count ?? rows.length } },
        commentsLoading: false,
      }));
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[blogStore] fetchComments error:', err);
      set((state) => ({
        comments: { ...state.comments, [blogPostId]: { items: [], totalCount: 0 } },
        commentsLoading: false,
      }));
    }
  },

  addComment: async (blogPostId, body) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Please sign in to comment.');
    if (!body.trim()) throw new Error('Comment cannot be empty.');

    try {
      await ensureSession();
    } catch (err) {
      console.error('[blogStore] addComment ensureSession failed:', err);
      throw new Error('Session expired. Please refresh the page and sign in again.');
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('blog_comments')
      .insert({ blog_post_id: blogPostId, user_id: userId, body: body.trim() })
      .select(`*, ${PROFILE_FIELDS_BLOG_COMMENT}`)
      .single();

    if (error) {
      console.error('[blogStore] addComment error:', error);
      throw new Error(error.message || 'Failed to post comment.');
    }

    if (data) {
      set((state) => {
        const current = state.comments[blogPostId] || { items: [], totalCount: 0 };
        return {
          comments: {
            ...state.comments,
            [blogPostId]: {
              items: [...current.items, data],
              totalCount: current.totalCount + 1,
            },
          },
        };
      });

      // Update comment_count on blog_posts (best-effort)
      fireAndForget('blog-comment-count-sync', async () => {
        await supabase
          .from('blog_posts')
          .update({ comment_count: (get().comments[blogPostId]?.totalCount || 1) })
          .eq('id', blogPostId);
        set({ postsLoaded: false });
      });
    }

    return data;
  },

  editComment: async (blogPostId, commentId, newBody) => {
    try {
      await ensureSession();
      const supabase = createClient();
      const { data, error } = await supabase
        .from('blog_comments')
        .update({ body: newBody.trim() })
        .eq('id', commentId)
        .select(`*, ${PROFILE_FIELDS_BLOG_COMMENT}`)
        .single();

      if (error) throw error;

      set((state) => {
        const current = state.comments[blogPostId];
        if (!current) return state;
        return {
          comments: {
            ...state.comments,
            [blogPostId]: {
              ...current,
              items: current.items.map((c) => (c.id === commentId ? data : c)),
            },
          },
        };
      });
      return data;
    } catch (err) {
      console.error('[blogStore] editComment error:', err);
      alert('Failed to edit comment: ' + (err.message || 'Unknown error'));
      return null;
    }
  },

  deleteComment: async (blogPostId, commentId) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      set((state) => {
        const current = state.comments[blogPostId];
        if (!current) return state;
        const newCount = current.totalCount - 1;
        // Update comment_count (best-effort)
        supabase
          .from('blog_posts')
          .update({ comment_count: Math.max(0, newCount) })
          .eq('id', blogPostId)
          .then(() => set({ postsLoaded: false }));
        return {
          comments: {
            ...state.comments,
            [blogPostId]: {
              items: current.items.filter((c) => c.id !== commentId),
              totalCount: newCount,
            },
          },
        };
      });
      return true;
    } catch (err) {
      console.error('[blogStore] deleteComment error:', err);
      return false;
    }
  },
}));
