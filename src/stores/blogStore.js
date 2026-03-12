'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { ensureSession } from '@/lib/ensureSession';
import { useAuthStore } from './authStore';

export const useBlogStore = create((set, get) => ({
  posts: [],
  postsLoaded: false,
  postsLoading: false,
  currentPost: null,
  currentPostLoading: false,
  comments: {},        // keyed by blogPostId: { items, totalCount }
  commentsLoading: false,

  fetchPosts: async (includeUnpublished = false) => {
    if (get().postsLoaded && !includeUnpublished) return get().posts;
    set({ postsLoading: true });

    try {
      const supabase = createClient();
      let query = supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image_url, tags, published, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (!includeUnpublished) {
        query = query.eq('published', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      const posts = data || [];
      set({ posts, postsLoaded: !includeUnpublished, postsLoading: false });
      return posts;
    } catch (err) {
      console.error('[blogStore] fetchPosts error:', err);
      set({ postsLoading: false });
      return [];
    }
  },

  fetchPost: async (slug) => {
    set({ currentPostLoading: true });

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      set({ currentPost: data, currentPostLoading: false });
      return data;
    } catch (err) {
      console.error('[blogStore] fetchPost error:', err);
      set({ currentPost: null, currentPostLoading: false });
      return null;
    }
  },

  createPost: async (post) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(post)
        .select()
        .single();

      if (error) throw error;
      set({ postsLoaded: false });
      return data;
    } catch (err) {
      console.error('[blogStore] createPost error:', err);
      return null;
    }
  },

  updatePost: async (id, updates) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('blog_posts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set({ postsLoaded: false });
      return data;
    } catch (err) {
      console.error('[blogStore] updatePost error:', err);
      return null;
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

  // ─── Blog Comments ───

  fetchComments: async (blogPostId) => {
    set({ commentsLoading: true });
    try {
      const supabase = createClient();
      const { data, count } = await supabase
        .from('blog_comments')
        .select('*, profiles:user_id(display_name, avatar_url, is_peer_advisor, drug, taper_stage, is_founding_member)', { count: 'exact' })
        .eq('blog_post_id', blogPostId)
        .order('created_at');

      const rows = data || [];
      set((state) => ({
        comments: { ...state.comments, [blogPostId]: { items: rows, totalCount: count ?? rows.length } },
        commentsLoading: false,
      }));
    } catch (err) {
      console.error('[blogStore] fetchComments error:', err);
      set((state) => ({
        comments: { ...state.comments, [blogPostId]: { items: [], totalCount: 0 } },
        commentsLoading: false,
      }));
    }
  },

  addComment: async (blogPostId, body) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Please sign in to comment.');
    if (!body.trim()) throw new Error('Comment cannot be empty.');

    await ensureSession();

    const supabase = createClient();
    const { data, error } = await supabase
      .from('blog_comments')
      .insert({ blog_post_id: blogPostId, user_id: userId, body: body.trim() })
      .select('*, profiles:user_id(display_name, avatar_url, is_peer_advisor, drug, taper_stage, is_founding_member)')
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
      supabase
        .from('blog_posts')
        .update({ comment_count: (get().comments[blogPostId]?.totalCount || 1) })
        .eq('id', blogPostId)
        .then(() => set({ postsLoaded: false }));
    }

    return data;
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
