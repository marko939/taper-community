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
  _abortControllers: {},  // keyed by operation name
  _pendingReply: {},      // keyed by threadId — dedup guard
  pendingQuote: null,
  setQuote: (quote) => set({ pendingQuote: quote }),
  clearQuote: () => set({ pendingQuote: null }),

  // Cancel a specific pending fetch
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

  // Cancel all pending fetches (called on route cleanup)
  cancelAll: () => {
    const controllers = get()._abortControllers;
    for (const ctrl of Object.values(controllers)) {
      ctrl.abort();
    }
    set({ _abortControllers: {} });
  },

  // Prevent unbounded memory growth — prune old cached threads/replies
  pruneCache: (keepThreadId) => {
    const state = get();
    const threadKeys = Object.keys(state.threads);
    const MAX_CACHED = 5;
    if (threadKeys.length <= MAX_CACHED) return;

    // Keep the most recently accessed threads + the current one
    const toRemove = threadKeys.filter((k) => k !== keepThreadId).slice(0, threadKeys.length - MAX_CACHED);
    const threads = { ...state.threads };
    const replies = { ...state.replies };
    const voteState = { ...state.voteState };
    const helpfulState = { ...state.helpfulState };

    for (const id of toRemove) {
      delete threads[id];
      delete replies[id];
      // Clean vote/helpful state for removed threads' replies
      for (const key of Object.keys(voteState)) {
        if (key.includes(id)) delete voteState[key];
      }
    }
    set({ threads, replies, voteState, helpfulState });
  },

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
    // Cancel any previous fetchThread in flight
    get().cancelPending('fetchThread');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchThread: controller },
    }));

    try {
      const supabase = createClient();

      const { data: threadData } = await supabase
        .from('threads')
        .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, post_count, drug_signature, location, avatar_url, is_founding_member), thread_forums(forum_id, forums:forum_id(name, slug, drug_slug))')
        .eq('id', threadId)
        .abortSignal(controller.signal)
        .single();

      if (threadData) {
        set((state) => ({
          threads: { ...state.threads, [threadId]: threadData },
        }));

        // Prune old cached data to prevent memory bloat
        get().pruneCache(threadId);

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
      if (err.name === 'AbortError') return null;
      console.error('[threadStore] fetchThread error:', err);
      return null;
    }
  },

  fetchReplies: async (threadId) => {
    get().cancelPending('fetchReplies');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, fetchReplies: controller },
    }));

    try {
      const supabase = createClient();
      const from = 0;
      const to = REPLIES_PER_PAGE - 1;

      const { data, count } = await supabase
        .from('replies')
        .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, post_count, drug_signature, location, avatar_url, is_founding_member)', { count: 'exact' })
        .eq('thread_id', threadId)
        .order('created_at')
        .abortSignal(controller.signal)
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
      if (err.name === 'AbortError') return;
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
    get().cancelPending('loadMoreReplies');
    const controller = new AbortController();
    set((state) => ({
      _abortControllers: { ...state._abortControllers, loadMoreReplies: controller },
    }));

    const supabase = createClient();
    const current = get().replies[threadId];
    if (!current) return;

    const nextPage = current.page + 1;
    const from = nextPage * REPLIES_PER_PAGE;
    const to = from + REPLIES_PER_PAGE - 1;

    try {
      const { data, count } = await supabase
        .from('replies')
        .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, post_count, drug_signature, location, avatar_url, is_founding_member)', { count: 'exact' })
        .eq('thread_id', threadId)
        .order('created_at')
        .abortSignal(controller.signal)
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
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[threadStore] loadMoreReplies error:', err);
    }
  },

  // Fetch replies up to the page containing a specific reply (for notification deep-links)
  fetchReplyPage: async (threadId, replyId) => {
    try {
      const supabase = createClient();

      // Find how many replies exist before this one (to determine its page)
      const { data: targetReply } = await supabase
        .from('replies')
        .select('created_at')
        .eq('id', replyId)
        .single();

      if (!targetReply) return;

      // Count replies before this one
      const { count: beforeCount } = await supabase
        .from('replies')
        .select('id', { count: 'exact', head: true })
        .eq('thread_id', threadId)
        .lt('created_at', targetReply.created_at);

      const targetPage = Math.floor((beforeCount || 0) / REPLIES_PER_PAGE);

      // Fetch all replies from page 0 through the target page
      const totalToFetch = (targetPage + 1) * REPLIES_PER_PAGE;
      const { data, count } = await supabase
        .from('replies')
        .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, post_count, drug_signature, location, avatar_url, is_founding_member)', { count: 'exact' })
        .eq('thread_id', threadId)
        .order('created_at')
        .range(0, totalToFetch - 1);

      const rows = data || [];
      const total = count ?? rows.length;

      set((state) => ({
        replies: {
          ...state.replies,
          [threadId]: {
            items: rows,
            hasMore: rows.length < total,
            totalCount: total,
            page: targetPage,
          },
        },
      }));
    } catch (err) {
      console.error('[threadStore] fetchReplyPage error:', err);
    }
  },

  addReply: async (threadId, body) => {
    // Dedup guard — prevent concurrent submissions for same thread
    if (get()._pendingReply[threadId]) {
      throw new Error('Reply is already being submitted.');
    }
    set((state) => ({
      _pendingReply: { ...state._pendingReply, [threadId]: true },
    }));

    try {
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

      // Recount actual replies and sync reply_count — prevents drift from triggers
      fireAndForget('sync-reply-count', async () => {
        const { count } = await supabase
          .from('replies')
          .select('id', { count: 'exact', head: true })
          .eq('thread_id', threadId);
        if (count != null) {
          await supabase.from('threads').update({ reply_count: count }).eq('id', threadId);
        }
      });

      // Bust forum cache (reply count changed)
      useForumStore.getState().invalidate();

      // Reply email notifications are now sent as a daily digest
      // via the cron job (/api/email/send → runner.js → runDigest)

      // Insert mention notifications (best-effort)
      // Note: thread_reply notifications for participants are handled by the
      // DB trigger handle_reply_notify — only mentions are inserted here.
      fireAndForget('mention-notifications', async () => {
        const mentionRegex = /@\[([^\]]+)\]\(([a-f0-9-]+)\)/g;
        const mentionedIds = new Set();
        let match;
        while ((match = mentionRegex.exec(body)) !== null) {
          if (match[2] !== userId) mentionedIds.add(match[2]);
        }
        if (mentionedIds.size === 0) return;

        const thread = get().threads[threadId];
        const title = thread?.title || '';
        const preview = body.slice(0, 120);

        const notifications = [...mentionedIds].map((uid) => ({
          user_id: uid,
          type: 'reply_mention',
          thread_id: threadId,
          reply_id: data.id,
          actor_id: userId,
          title,
          body: preview,
        }));
        await supabase.from('notifications').insert(notifications);
      });
    }

    return data;
    } finally {
      set((state) => {
        const pending = { ...state._pendingReply };
        delete pending[threadId];
        return { _pendingReply: pending };
      });
    }
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

      // Recount replies after edit to correct any trigger-induced drift
      fireAndForget('sync-reply-count', async () => {
        const { count } = await supabase
          .from('replies')
          .select('id', { count: 'exact', head: true })
          .eq('thread_id', threadId);
        if (count != null) {
          await supabase.from('threads').update({ reply_count: count }).eq('id', threadId);
        }
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

      // Recount actual replies and sync reply_count — no DB decrement trigger exists
      fireAndForget('sync-reply-count', async () => {
        const { count } = await supabase
          .from('replies')
          .select('id', { count: 'exact', head: true })
          .eq('thread_id', threadId);
        if (count != null) {
          await supabase.from('threads').update({ reply_count: count }).eq('id', threadId);
        }
      });

      useForumStore.getState().invalidate();
      return true;
    } catch (err) {
      console.error('[threadStore] deleteReply error:', err);
      return false;
    }
  },

  // Vote on thread or reply — uses server API to bypass RLS
  vote: async (type, targetId, voteType) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId || !targetId) return;

    const key = `${type}_${targetId}`;
    const current = get().voteState[key] || { userVote: null, score: 0 };
    const isToggleOff = current.userVote === voteType;

    // Optimistic UI update
    const optimisticScore = isToggleOff ? current.score - 1 : current.score + 1;
    const optimisticVote = isToggleOff ? null : voteType;
    set((state) => ({
      voteState: { ...state.voteState, [key]: { userVote: optimisticVote, score: optimisticScore } },
    }));

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, targetId, voteType, userId }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Vote failed');

      // Use the real score from server (always accurate)
      set((state) => ({
        voteState: {
          ...state.voteState,
          [key]: {
            userVote: result.action === 'removed' ? null : voteType,
            score: result.score,
          },
        },
      }));
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

  // Toggle helpful on a reply — uses server API to bypass RLS
  toggleHelpful: async (replyId, initialCount) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const current = get().helpfulState[replyId] || { hasVoted: false, count: initialCount ?? 0 };
    const isToggleOff = current.hasVoted;

    // Optimistic UI update
    set((state) => ({
      helpfulState: {
        ...state.helpfulState,
        [replyId]: { hasVoted: !isToggleOff, count: current.count + (isToggleOff ? -1 : 1) },
      },
    }));

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'helpful', targetId: replyId, voteType: 'helpful', userId }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Vote failed');

      set((state) => ({
        helpfulState: {
          ...state.helpfulState,
          [replyId]: { hasVoted: result.action === 'added', count: result.score },
        },
      }));
    } catch (err) {
      console.error('[threadStore] toggleHelpful error:', err);
      // Rollback
      set((state) => ({
        helpfulState: { ...state.helpfulState, [replyId]: current },
      }));
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
