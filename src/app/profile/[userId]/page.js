'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { useJournalStore } from '@/stores/journalStore';
import { useFollowStore } from '@/stores/followStore';
import Avatar from '@/components/shared/Avatar';
import { PeerAdvisorBadge, StaffBadge } from '@/components/shared/Badge';
import DrugSignature from '@/components/shared/DrugSignature';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import { PageLoading } from '@/components/shared/LoadingSpinner';
import { ADMIN_USER_ID, isMod } from '@/lib/blog';
import { useRouteCleanup } from '@/hooks/useRouteCleanup';
import { useState } from 'react';

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function ProfilePage() {
  useRouteCleanup();
  const { userId } = useParams();
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const profileData = useProfileStore((s) => s.profiles[userId]);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const publicEntriesData = useJournalStore((s) => s.publicEntries[userId]);
  const fetchPublicEntries = useJournalStore((s) => s.fetchPublicEntries);
  const [tab, setTab] = useState('posts');

  const isOwnProfile = currentUser?.id === userId;
  const following = useFollowStore((s) => s.following);
  const followingLoaded = useFollowStore((s) => s.followingLoaded);
  const fetchFollowing = useFollowStore((s) => s.fetchFollowing);
  const fetchFollowCounts = useFollowStore((s) => s.fetchFollowCounts);
  const followCounts = useFollowStore((s) => s.followCounts[userId]);
  const toggleFollow = useFollowStore((s) => s.toggleFollow);
  const isFollowing = following.has(userId);

  useEffect(() => {
    fetchProfile(userId);
    fetchFollowCounts(userId);
    if (!isOwnProfile) {
      fetchPublicEntries(userId);
    }
    if (currentUser?.id) {
      fetchFollowing(currentUser.id);
    }
  }, [userId, isOwnProfile, currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loading = profileData?.loading ?? true;

  if (loading) return <PageLoading />;

  const profile = profileData?.data;
  const threads = profileData?.threads || [];
  const replies = profileData?.replies || [];
  const allJournal = profileData?.journal || [];

  if (!profile) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-semibold text-foreground">User not found</h1>
        <Link href="/forums" className="link mt-4 inline-block">Back to Forums</Link>
      </div>
    );
  }

  const karma = threads.reduce((sum, t) => sum + (t.vote_score || 0), 0) +
    replies.reduce((sum, r) => sum + (r.vote_score || 0), 0);

  const groupedThreads = (() => {
    const groups = [];
    const used = new Set();
    const sorted = [...threads].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    for (let i = 0; i < sorted.length; i++) {
      if (used.has(sorted[i].id)) continue;
      const main = sorted[i];
      const siblings = [main];
      used.add(main.id);

      for (let j = i + 1; j < sorted.length; j++) {
        if (used.has(sorted[j].id)) continue;
        const other = sorted[j];
        const timeDiff = Math.abs(new Date(main.created_at) - new Date(other.created_at));
        if (main.title === other.title && main.body === other.body && timeDiff < 60000) {
          siblings.push(other);
          used.add(other.id);
        }
      }
      groups.push({ main, forums: siblings.map((s) => s.forums).filter(Boolean) });
    }
    return groups;
  })();

  const publicEntries = publicEntriesData?.entries || [];
  const journalLoading = publicEntriesData?.loading ?? false;
  const journalEntries = isOwnProfile ? allJournal : publicEntries;

  const tabs = ['posts', 'replies', 'journal', ...(profile?.username ? ['taper journal'] : [])];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Profile header */}
      <div className="card">
        <div className="flex items-start gap-4">
          <Avatar name={profile.display_name} avatarUrl={profile.avatar_url} size="lg" foundingMember={profile.is_founding_member} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">{profile.display_name}</h1>
              {isMod(userId) && <StaffBadge />}
              {profile.is_peer_advisor && <PeerAdvisorBadge />}
            </div>
            {profile.location && (
              <p className="text-sm text-text-subtle">{profile.location}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-muted">
              <span>{profile.post_count} posts</span>
              <span>{karma} karma</span>
              {followCounts && <span>{followCounts.followers} follower{followCounts.followers !== 1 ? 's' : ''}</span>}
              <span>Joined {new Date(profile.joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
            </div>
            {profile.drug && (
              <p className="mt-2 text-sm text-text-muted">
                Tapering: <span className="font-medium text-foreground">{profile.drug}</span>
                {profile.taper_stage && <span className="capitalize"> — {profile.taper_stage}</span>}
                {profile.duration && <span> ({profile.duration})</span>}
              </p>
            )}
            {profile.bio && (
              <p className="mt-3 text-sm text-text-muted">{profile.bio}</p>
            )}
            <DrugSignature signature={profile.drug_signature} />
            {!isOwnProfile && currentUser && followingLoaded && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => toggleFollow(currentUser.id, userId)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    isFollowing
                      ? 'border border-border-subtle bg-surface-glass text-text-muted hover:border-red-400 hover:text-red-500'
                      : 'bg-accent-blue text-white hover:opacity-90'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                {(userId === ADMIN_USER_ID || isMod(currentUser?.id)) && (
                  <button
                    onClick={() => router.push(`/messages?to=${userId}`)}
                    className="flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition hover:bg-purple-ghost"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    Message
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-full border border-border-subtle bg-surface-glass p-1">
        {tabs.map((t) => {
          const count = t === 'posts' ? groupedThreads.length : t === 'replies' ? replies.length : t === 'journal' ? journalEntries.length : null;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                tab === t
                  ? 'bg-accent-blue text-white'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              {t}{count !== null ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === 'posts' && (
        <div className="space-y-3">
          {groupedThreads.length === 0 ? (
            <p className="py-8 text-center text-text-subtle">No posts yet.</p>
          ) : (
            groupedThreads.map(({ main, forums }) => (
              <Link
                key={main.id}
                href={`/thread/${main.id}`}
                className="card group block transition hover:shadow-lg"
              >
                <h3 className="font-semibold text-foreground group-hover:text-accent-blue transition">
                  {main.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-subtle">
                  {forums.map((f) => (
                    <span key={f.slug || f.name} className="badge-soft">{f.name}</span>
                  ))}
                  {forums.length > 1 && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: 'var(--purple-ghost)', color: 'var(--purple)' }}
                    >
                      posted in {forums.length} topics
                    </span>
                  )}
                  <span>{timeAgo(main.created_at)}</span>
                  <span>{main.reply_count} replies</span>
                  <span>{main.vote_score || 0} points</span>
                </div>
                {main.body && (
                  <p className="mt-2 text-sm text-text-muted line-clamp-2">{main.body}</p>
                )}
              </Link>
            ))
          )}
        </div>
      )}

      {tab === 'replies' && (
        <div className="space-y-3">
          {replies.length === 0 ? (
            <p className="py-8 text-center text-text-subtle">No replies yet.</p>
          ) : (
            replies.map((reply) => (
              <Link
                key={reply.id}
                href={`/thread/${reply.threads?.id}`}
                className="card group block transition hover:shadow-lg"
              >
                <p className="text-xs text-text-subtle">
                  Reply to: <span className="font-medium text-foreground">{reply.threads?.title}</span>
                </p>
                <p className="mt-2 text-sm text-text-muted line-clamp-3">{reply.body}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-text-subtle">
                  <span>{timeAgo(reply.created_at)}</span>
                  <span>{reply.vote_score || 0} points</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === 'taper journal' && profile?.username && (
        <div className="card text-center py-10">
          <svg className="mx-auto h-12 w-12 text-text-subtle mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {profile.display_name}&apos;s Taper Journey
          </h3>
          <p className="text-sm text-text-muted mb-4">
            View dose charts, mood tracking, assessments, and public journal entries.
          </p>
          <Link
            href={`/journey/${profile.username}`}
            className="btn btn-primary inline-flex items-center gap-2 no-underline"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            View Taper Journal
          </Link>
        </div>
      )}

      {tab === 'journal' && (
        <div className="space-y-3">
          {journalLoading && !isOwnProfile ? (
            <p className="py-8 text-center text-text-subtle">Loading...</p>
          ) : journalEntries.length === 0 ? (
            <p className="py-8 text-center text-text-subtle">
              {isOwnProfile ? 'No journal entries yet. ' : 'No public journal entries.'}
              {isOwnProfile && (
                <Link href="/journal" className="text-accent-blue hover:underline">Start journaling</Link>
              )}
            </p>
          ) : (
            <>
              {isOwnProfile && (
                <p className="text-xs text-text-subtle">
                  Entries marked as public are visible to others. Private entries are only visible to you.
                </p>
              )}
              {journalEntries.map((entry) => (
                <JournalEntryCard key={entry.id} entry={entry} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
