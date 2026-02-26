'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { ensureSession } from '@/lib/ensureSession';
import { fireAndForget } from '@/lib/fireAndForget';
import { useAuthStore } from './authStore';
import { useForumStore } from './forumStore';

const REPLIES_PER_PAGE = 25;

export const useThreadStore = create((set, get) => ({
  threads: {},       // keyed by threadId
  replies: {},       // keyed by threadId: { items, hasMore, totalCount, page }
  voteState: {},     // keyed by `${type}_${targetId}`: { userVote, score }
  helpfulState: {},  // keyed by replyId: { hasVoted, count }
  pendingQuote: null,
  setQuote: (quote) => set({ pendingQuote: quote }),
  clearQuote: () => set({ pendingQuote: null }),

  updateThread: (threadId, partial) => {
    set((state) => ({
      threads: {
        ...state.threads,
        [threadId]: state.threads[threadId]
          ? { ...state.threads[threadId], ...partial }
          : null,
      },
    }));
  },

  fetchThread: async (threadId) => {
    try {
      const supabase = createClient();

      const { data: threadData } = await supabase
        .from('threads')
        .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, post_count, drug_signature, location, avatar_url, is_founding_member), thread_forums(forum_id, forums:forum_id(name, slug, drug_slug))')
        .eq('id', threadId)
        .single();

      if (threadData) {
        set((state) => ({
          threads: { ...state.threads, [threadId]: threadData },
        }));

        // Increment view count (best-effort, fire-and-forget)
        fireAndForget('increment-view-count', () =>
          supabase
            .from('threads')
            .update({ view_count: (threadData.view_count || 0) + 1 })
            .eq('id', threadId)
        );
      }

      return threadData;
    } catch (err) {
      console.error('[threadStore] fetchThread error:', err);
      return null;
    }
  },

  fetchReplies: async (threadId) => {
    try {
      const supabase = createClient();
      const from = 0;
      const to = REPLIES_PER_PAGE - 1;

      const { data, count } = await supabase
        .from('replies')
        .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, post_count, drug_signature, location, avatar_url, is_founding_member)', { count: 'exact' })
        .eq('thread_id', threadId)
        .order('created_at')
        .range(from, to);

      const rows = data || [];
      const total = count ?? rows.length;

      set((state) => ({
        replies: {
          ...state.replies,
          [threadId]: {
            items: rows,
            hasMore: rows.length < total,
            totalCount: total,
            page: 0,
          },
        },
      }));
    } catch (err) {
      console.error('[threadStore] fetchReplies error:', err);
      set((state) => ({
        replies: {
          ...state.replies,
          [threadId]: { items: [], hasMore: false, totalCount: 0, page: 0 },
        },
      }));
    }
  },

  loadMoreReplies: async (threadId) => {
    const supabase = createClient();
    const current = get().replies[threadId];
    if (!current) return;

    const nextPage = current.page + 1;
    const from = nextPage * REPLIES_PER_PAGE;
    const to = from + REPLIES_PER_PAGE - 1;

    const { data, count } = await supabase
      .from('replies')
      .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, post_count, drug_signature, location, avatar_url, is_founding_member)', { count: 'exact' })
      .eq('thread_id', threadId)
      .order('created_at')
      .range(from, to);

    const rows = data || [];
    const total = count ?? (current.totalCount);

    set((state) => ({
      replies: {
        ...state.replies,
        [threadId]: {
          items: [...current.items, ...rows],
          hasMore: from + rows.length < total,
          totalCount: total,
          page: nextPage,
        },
      },
    }));
  },

  addReply: async (threadId, body) => {
    const supabase = createClient();
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Please sign in to reply.');
    if (!body.trim()) throw new Error('Reply cannot be empty.');

    // Ensure session is valid before inserting — prevents silent RLS failures
    await ensureSession();

    const { data, error } = await supabase
      .from('replies')
      .insert({ thread_id: threadId, user_id: userId, body: body.trim() })
      .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, post_count, drug_signature, avatar_url, is_founding_member)')
      .single();

    if (error) {
      console.error('[threadStore] addReply error:', error);
      throw new Error(error.message || 'Failed to post reply.');
    }

    if (data) {
      set((state) => {
        const current = state.replies[threadId] || { items: [], hasMore: false, totalCount: 0, page: 0 };
        return {
          replies: {
            ...state.replies,
            [threadId]: {
              ...current,
              items: [...current.items, data],
              totalCount: current.totalCount + 1,
            },
          },
        };
      });

      // Bust forum cache (reply count changed)
      useForumStore.getState().invalidate();

      // Fire email notifications (best-effort)
      fireAndForget('notify-email', () =>
        fetch('/api/notify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reply_id: data.id, thread_id: threadId }),
        })
      );
    }

    return data;
  },

  editReply: async (threadId, replyId, newBody) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('replies')
        .update({ body: newBody.trim() })
        .eq('id', replyId);
      if (error) throw error;

      set((state) => {
        const current = state.replies[threadId];
        if (!current) return state;
        return {
          replies: {
            ...state.replies,
            [threadId]: {
              ...current,
              items: current.items.map((r) =>
                r.id === replyId ? { ...r, body: newBody.trim() } : r
              ),
            },
          },
        };
      });
      return true;
    } catch (err) {
      console.error('[threadStore] editReply error:', err);
      return false;
    }
  },

  deleteReply: async (threadId, replyId) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('replies')
        .delete()
        .eq('id', replyId);
      if (error) throw error;

      set((state) => {
        const current = state.replies[threadId];
        if (!current) return state;
        return {
          replies: {
            ...state.replies,
            [threadId]: {
              ...current,
              items: current.items.filter((r) => r.id !== replyId),
              totalCount: current.totalCount - 1,
            },
          },
        };
      });
      useForumStore.getState().invalidate();
      return true;
    } catch (err) {
      console.error('[threadStore] deleteReply error:', err);
      return false;
    }
  },

  // Vote on thread or reply
  vote: async (type, targetId, voteType) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId || !targetId) return;

    const supabase = createClient();
    const table = type === 'thread' ? 'thread_votes' : 'reply_votes';
    const idColumn = type === 'thread' ? 'thread_id' : 'reply_id';
    const scoreTable = type === 'thread' ? 'threads' : 'replies';
    const key = `${type}_${targetId}`;
    const current = get().voteState[key] || { userVote: null, score: 0 };

    try {
      if (current.userVote === voteType) {
        // Remove vote (unlike)
        const newScore = current.score - 1;
        set((state) => ({
          voteState: { ...state.voteState, [key]: { userVote: null, score: newScore } },
        }));
        await supabase.from(table).delete().eq('user_id', userId).eq(idColumn, targetId);
        await supabase.from(scoreTable).update({ vote_score: newScore }).eq('id', targetId);
      } else {
        // New vote (like)
        const newScore = current.score + 1;
        set((state) => ({
          voteState: { ...state.voteState, [key]: { userVote: voteType, score: newScore } },
        }));
        await supabase.from(table).insert({ user_id: userId, [idColumn]: targetId, vote_type: voteType });
        await supabase.from(scoreTable).update({ vote_score: newScore }).eq('id', targetId);
      }
    } catch (err) {
      console.error('[threadStore] vote error:', err);
      // Rollback to previous state
      set((state) => ({
        voteState: { ...state.voteState, [key]: current },
      }));
    }
  },

  // Initialize vote state for a target (called on mount)
  initVoteState: async (type, targetId, initialScore) => {
    if (!targetId) return;
    const key = `${type}_${targetId}`;
    // Already initialized
    if (get().voteState[key]) return;

    set((state) => ({
      voteState: { ...state.voteState, [key]: { userVote: null, score: initialScore } },
    }));

    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      const supabase = createClient();
      const table = type === 'thread' ? 'thread_votes' : 'reply_votes';
      const idColumn = type === 'thread' ? 'thread_id' : 'reply_id';

      const { data } = await supabase
        .from(table)
        .select('vote_type')
        .eq('user_id', userId)
        .eq(idColumn, targetId)
        .maybeSingle();

      if (data) {
        set((state) => ({
          voteState: {
            ...state.voteState,
            [key]: { ...state.voteState[key], userVote: data.vote_type },
          },
        }));
      }
    } catch (err) {
      console.error('[threadStore] initVoteState error:', err);
    }
  },

  // Toggle helpful on a reply
  toggleHelpful: async (replyId, initialCount) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const supabase = createClient();
    const current = get().helpfulState[replyId] || { hasVoted: false, count: initialCount ?? 0 };

    if (current.hasVoted) {
      // Optimistic: remove vote
      set((state) => ({
        helpfulState: { ...state.helpfulState, [replyId]: { hasVoted: false, count: current.count - 1 } },
      }));
      await supabase.from('helpful_votes').delete().eq('user_id', userId).eq('reply_id', replyId);
      await supabase.from('replies').update({ helpful_count: current.count - 1 }).eq('id', replyId);
    } else {
      // Optimistic: add vote
      set((state) => ({
        helpfulState: { ...state.helpfulState, [replyId]: { hasVoted: true, count: current.count + 1 } },
      }));
      await supabase.from('helpful_votes').insert({ user_id: userId, reply_id: replyId });
      await supabase.from('replies').update({ helpful_count: current.count + 1 }).eq('id', replyId);
    }
  },

  // Initialize helpful state for a reply (called on mount)
  initHelpfulState: async (replyId, initialCount) => {
    if (!replyId || get().helpfulState[replyId]) return;

    set((state) => ({
      helpfulState: { ...state.helpfulState, [replyId]: { hasVoted: false, count: initialCount ?? 0 } },
    }));

    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const supabase = createClient();
    const { data } = await supabase
      .from('helpful_votes')
      .select('user_id')
      .eq('user_id', userId)
      .eq('reply_id', replyId)
      .maybeSingle();

    if (data) {
      set((state) => ({
        helpfulState: {
          ...state.helpfulState,
          [replyId]: { ...state.helpfulState[replyId], hasVoted: true },
        },
      }));
    }
  },
}));
