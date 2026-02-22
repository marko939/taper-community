'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function HelpfulButton({ replyId, initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkVote = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('helpful_votes')
        .select('user_id')
        .eq('user_id', user.id)
        .eq('reply_id', replyId)
        .single();

      if (data) setHasVoted(true);
    };
    checkVote();
  }, [replyId]);

  const handleClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || loading) return;

    setLoading(true);

    if (hasVoted) {
      await supabase
        .from('helpful_votes')
        .delete()
        .eq('user_id', user.id)
        .eq('reply_id', replyId);

      await supabase
        .from('replies')
        .update({ helpful_count: count - 1 })
        .eq('id', replyId);

      setCount((c) => c - 1);
      setHasVoted(false);
    } else {
      await supabase
        .from('helpful_votes')
        .insert({ user_id: user.id, reply_id: replyId });

      await supabase
        .from('replies')
        .update({ helpful_count: count + 1 })
        .eq('id', replyId);

      setCount((c) => c + 1);
      setHasVoted(true);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
        hasVoted
          ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
          : 'border-border-subtle text-text-subtle hover:border-accent-blue hover:text-accent-blue'
      }`}
    >
      <svg
        className="h-3.5 w-3.5"
        fill={hasVoted ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      {count > 0 && <span>{count}</span>}
      <span>Helpful</span>
    </button>
  );
}
