'use client';

import { useEffect } from 'react';
import { useThreadStore } from '@/stores/threadStore';

export default function VoteButton({ type = 'thread', targetId, initialScore = 0 }) {
  const voteData = useThreadStore((s) => s.voteState[`${type}_${targetId}`]);
  const initVoteState = useThreadStore((s) => s.initVoteState);
  const vote = useThreadStore((s) => s.vote);

  const score = voteData?.score ?? initialScore;
  const userVote = voteData?.userVote ?? null;

  useEffect(() => {
    initVoteState(type, targetId, initialScore);
  }, [type, targetId, initialScore, initVoteState]);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={() => vote(type, targetId, 'up')}
        className="rounded p-1 transition"
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
        onClick={() => vote(type, targetId, 'down')}
        className="rounded p-1 transition"
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
