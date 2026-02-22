'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePublicJournal } from '@/hooks/useJournal';
import Avatar from '@/components/shared/Avatar';
import { PeerAdvisorBadge } from '@/components/shared/Badge';
import DrugSignature from '@/components/shared/DrugSignature';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import { PageLoading } from '@/components/shared/LoadingSpinner';

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
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [threads, setThreads] = useState([]);
  const [replies, setReplies] = useState([]);
  const [allJournal, setAllJournal] = useState([]);
  const [tab, setTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { entries: publicEntries, loading: journalLoading } = usePublicJournal(userId);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    const fetchData = async () => {
      const promises = [
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase
          .from('threads')
          .select('*, forums:forum_id(name, drug_slug, slug)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('replies')
          .select('*, threads:thread_id(id, title)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20),
      ];

      // If own profile, fetch all journal entries
      if (isOwnProfile) {
        promises.push(
          supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
        );
      }

      const results = await Promise.all(promises);

      setProfile(results[0].data);
      setThreads(results[1].data || []);
      setReplies(results[2].data || []);
      if (isOwnProfile && results[3]) {
        setAllJournal(results[3].data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [userId, isOwnProfile]);

  if (loading) return <PageLoading />;

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

  // Journal entries to display: own profile shows all with visibility indicators, others see public only
  const journalEntries = isOwnProfile ? allJournal : publicEntries;

  const tabs = ['posts', 'replies', 'journal'];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Profile header */}
      <div className="card">
        <div className="flex items-start gap-4">
          <Avatar name={profile.display_name} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">{profile.display_name}</h1>
              {profile.is_peer_advisor && <PeerAdvisorBadge />}
            </div>
            {profile.location && (
              <p className="text-sm text-text-subtle">{profile.location}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-muted">
              <span>{profile.post_count} posts</span>
              <span>{karma} karma</span>
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
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-full border border-border-subtle bg-surface-glass p-1">
        {tabs.map((t) => {
          const count = t === 'posts' ? threads.length : t === 'replies' ? replies.length : journalEntries.length;
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
              {t} ({count})
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === 'posts' && (
        <div className="space-y-3">
          {threads.length === 0 ? (
            <p className="py-8 text-center text-text-subtle">No posts yet.</p>
          ) : (
            threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/thread/${thread.id}`}
                className="card group block transition hover:shadow-lg"
              >
                <h3 className="font-semibold text-foreground group-hover:text-accent-blue transition">
                  {thread.title}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-text-subtle">
                  {thread.forums?.name && (
                    <span className="badge-soft">{thread.forums.name}</span>
                  )}
                  <span>{timeAgo(thread.created_at)}</span>
                  <span>{thread.reply_count} replies</span>
                  <span>{thread.vote_score || 0} points</span>
                </div>
                {thread.body && (
                  <p className="mt-2 text-sm text-text-muted line-clamp-2">{thread.body}</p>
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
