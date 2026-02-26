'use client';

import { useEffect } from 'react';
import { useThreadStore } from '@/stores/threadStore';

export default function VoteButton({ type = 'thread', targetId, initialScore = 0 }) {
  const voteData = useThreadStore((s) => s.voteState[`${type}_${targetId}`]);
  const initVoteState = useThreadStore((s) => s.initVoteState);
  const vote = useThreadStore((s) => s.vote);

  const score = voteData?.score ?? initialScore;
  const userVote = voteData?.userVote ?? null;
  const isLiked = userVote === 'up';

  useEffect(() => {
    initVoteState(type, targetId, initialScore);
  }, [type, targetId, initialScore, initVoteState]);

  return (
    <button
      onClick={() => vote(type, targetId, 'up')}
      className="flex items-center gap-1.5 rounded-lg px-2 py-1 transition hover:bg-purple-ghost/50"
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      {isLiked ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="var(--purple)" stroke="var(--purple)" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      )}
      <span className="text-sm font-semibold" style={{ color: isLiked ? 'var(--purple)' : 'var(--text-muted)' }}>
        {score}
      </span>
    </button>
  );
}
