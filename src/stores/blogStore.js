'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export const useBlogStore = create((set, get) => ({
  posts: [],
  postsLoaded: false,
  postsLoading: false,
  currentPost: null,
  currentPostLoading: false,

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
}));
