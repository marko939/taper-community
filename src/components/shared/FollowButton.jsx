'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useFollowStore } from '@/stores/followStore';

export default function FollowButton({ targetUserId }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const following = useFollowStore((s) => s.following);
  const toggleFollow = useFollowStore((s) => s.toggleFollow);

  // Don't show for own posts or if no target
  if (!targetUserId || user?.id === targetUserId) return null;

  const isFollowing = following.has(targetUserId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Redirect unauthenticated users to sign in
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    await toggleFollow(user.id, targetUserId);
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
