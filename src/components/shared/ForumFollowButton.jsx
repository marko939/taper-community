'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useFollowStore } from '@/stores/followStore';

export default function ForumFollowButton({ forumId }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const followedForums = useFollowStore((s) => s.followedForums);
  const toggleForumFollow = useFollowStore((s) => s.toggleForumFollow);

  if (!forumId || !user) return null;

  const isFollowing = followedForums.has(forumId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/auth/signin');
      return;
    }

    await toggleForumFollow(user.id, forumId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition ${
        isFollowing
          ? 'border-purple/30 bg-purple/10 text-purple hover:border-red-300 hover:bg-red-50 hover:text-red-500'
          : 'border-border-subtle text-text-subtle hover:border-purple-pale hover:text-purple'
      }`}
    >
      {isFollowing ? 'Following' : '+ Follow'}
    </button>
  );
}
