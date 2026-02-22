'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function VoteButton({ type = 'thread', targetId, initialScore = 0 }) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(null); // 'up', 'down', or null
  const [userId, setUserId] = useState(null);
  const supabase = createClient();

  const table = type === 'thread' ? 'thread_votes' : 'reply_votes';
  const idColumn = type === 'thread' ? 'thread_id' : 'reply_id';
  const scoreTable = type === 'thread' ? 'threads' : 'replies';

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from(table)
        .select('vote_type')
        .eq('user_id', user.id)
        .eq(idColumn, targetId)
        .single();

      if (data) setUserVote(data.vote_type);
    };
    init();
  }, [targetId]);

  const handleVote = async (voteType) => {
    if (!userId) return;

    if (userVote === voteType) {
      // Remove vote
      setScore((s) => s + (voteType === 'up' ? -1 : 1));
      setUserVote(null);
      await supabase.from(table).delete().eq('user_id', userId).eq(idColumn, targetId);
      await supabase.from(scoreTable).update({ vote_score: score + (voteType === 'up' ? -1 : 1) }).eq('id', targetId);
    } else if (userVote) {
      // Change vote direction
      const delta = voteType === 'up' ? 2 : -2;
      setScore((s) => s + delta);
      setUserVote(voteType);
      await supabase.from(table).update({ vote_type: voteType }).eq('user_id', userId).eq(idColumn, targetId);
      await supabase.from(scoreTable).update({ vote_score: score + delta }).eq('id', targetId);
    } else {
      // New vote
      const delta = voteType === 'up' ? 1 : -1;
      setScore((s) => s + delta);
      setUserVote(voteType);
      await supabase.from(table).insert({ user_id: userId, [idColumn]: targetId, vote_type: voteType });
      await supabase.from(scoreTable).update({ vote_score: score + delta }).eq('id', targetId);
    }
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={() => handleVote('up')}
        className={`rounded p-1 transition ${
          userVote === 'up' ? 'text-purple' : 'text-text-subtle'
        }`}
        style={userVote !== 'up' ? { color: 'var(--text-subtle)' } : { color: 'var(--purple)' }}
        aria-label="Upvote"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
      <span className="text-sm font-semibold" style={{
        color: userVote === 'up' ? 'var(--purple)' : userVote === 'down' ? 'var(--accent-red)' : 'var(--text-muted)'
      }}>
        {score}
      </span>
      <button
        onClick={() => handleVote('down')}
        className={`rounded p-1 transition ${
          userVote === 'down' ? '' : ''
        }`}
        style={userVote !== 'down' ? { color: 'var(--text-subtle)' } : { color: 'var(--accent-red)' }}
        aria-label="Downvote"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    </div>
  );
}
