'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useFollowStore } from '@/stores/followStore';

export default function FollowThreadButton({ threadId }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const threadFollows = useFollowStore((s) => s.threadFollows);
  const toggleThreadFollow = useFollowStore((s) => s.toggleThreadFollow);

  if (!user) return null;

  const isFollowing = threadFollows.has(threadId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/auth/signin');
      return;
    }

    await toggleThreadFollow(user.id, threadId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
        isFollowing
          ? 'border-purple bg-purple/10 text-purple'
          : 'border-border-subtle text-text-subtle hover:border-purple-pale hover:text-purple'
      }`}
    >
      <svg className="h-3.5 w-3.5" fill={isFollowing ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
      {isFollowing ? 'Following' : '+ Follow'}
    </button>
  );
}
