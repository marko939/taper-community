'use client';

import { useEffect } from 'react';
import { useThreadStore } from '@/stores/threadStore';

export default function HelpfulButton({ replyId, initialCount = 0 }) {
  const helpfulData = useThreadStore((s) => s.helpfulState[replyId]);
  const initHelpfulState = useThreadStore((s) => s.initHelpfulState);
  const toggleHelpful = useThreadStore((s) => s.toggleHelpful);

  const count = helpfulData?.count ?? initialCount;
  const hasVoted = helpfulData?.hasVoted ?? false;

  useEffect(() => {
    initHelpfulState(replyId, initialCount);
  }, [replyId, initialCount, initHelpfulState]);

  return (
    <button
      onClick={() => toggleHelpful(replyId, initialCount)}
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
