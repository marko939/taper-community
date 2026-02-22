'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useJournal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchEntries = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    setEntries(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = async (entry) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { published_forums = [], ...entryData } = entry;

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        ...entryData,
        user_id: user.id,
        is_public: entry.is_public || false,
        published_forums: published_forums,
        thread_ids: [],
      })
      .select()
      .single();

    if (!error && data) {
      // If forums selected, create threads for each
      if (published_forums.length > 0 && entry.notes) {
        const threadTitle = `${entry.drug || 'Journal'} — ${new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        const threadIds = [];

        for (const forumId of published_forums) {
          const { data: thread } = await supabase
            .from('threads')
            .insert({
              forum_id: forumId,
              user_id: user.id,
              title: threadTitle,
              body: entry.notes,
              tags: ['taper update'],
            })
            .select('id')
            .single();

          if (thread) threadIds.push(thread.id);
        }

        // Update journal entry with thread IDs
        if (threadIds.length > 0) {
          await supabase
            .from('journal_entries')
            .update({ thread_ids: threadIds })
            .eq('id', data.id);
          data.thread_ids = threadIds;
        }
      }

      setEntries((prev) => [data, ...prev]);
    }
    return { data, error };
  };

  const getShareLink = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Check for existing share
    const { data: existing } = await supabase
      .from('journal_shares')
      .select('share_token')
      .eq('user_id', user.id)
      .single();

    if (existing) return existing.share_token;

    // Create new share
    const { data } = await supabase
      .from('journal_shares')
      .insert({ user_id: user.id })
      .select('share_token')
      .single();

    return data?.share_token || null;
  };

  return { entries, loading, addEntry, fetchEntries, getShareLink };
}

export function useSharedJournal(shareToken) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!shareToken) return;

    const fetchShared = async () => {
      // Get the user_id from the share token
      const { data: share } = await supabase
        .from('journal_shares')
        .select('user_id')
        .eq('share_token', shareToken)
        .single();

      if (!share) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', share.user_id)
        .order('date', { ascending: true });

      setEntries(data || []);
      setLoading(false);
    };

    fetchShared();
  }, [shareToken]);

  return { entries, loading };
}

export function usePublicJournal(userId) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    const fetchPublic = async () => {
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('date', { ascending: false });

      setEntries(data || []);
      setLoading(false);
    };

    fetchPublic();
  }, [userId]);

  return { entries, loading };
}
