import { createClient as createAuthClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/blog';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || !isAdmin(user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, deleteAuthUser } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  // Prevent deleting admin accounts
  if (isAdmin(userId)) {
    return NextResponse.json({ error: 'Cannot cleanup admin accounts' }, { status: 403 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const results = {};

  // Get user's thread IDs first (needed for junction tables)
  const { data: userThreads } = await supabase
    .from('threads')
    .select('id')
    .eq('user_id', userId);
  const threadIds = (userThreads || []).map((t) => t.id);

  // Delete in FK-safe order
  const deletions = [
    // Junction/child tables referencing threads
    ...(threadIds.length > 0
      ? [
          ['thread_forums', supabase.from('thread_forums').delete().in('thread_id', threadIds)],
          ['thread_follows', supabase.from('thread_follows').delete().in('thread_id', threadIds)],
        ]
      : []),
    // User follows (also delete where user is followed)
    ['thread_follows_user', supabase.from('thread_follows').delete().eq('user_id', userId)],
    ['notifications', supabase.from('notifications').delete().eq('user_id', userId)],
    ['notifications_actor', supabase.from('notifications').delete().eq('actor_id', userId)],
    ['thread_votes', supabase.from('thread_votes').delete().eq('user_id', userId)],
    ['reply_votes', supabase.from('reply_votes').delete().eq('user_id', userId)],
    ['helpful_votes', supabase.from('helpful_votes').delete().eq('user_id', userId)],
    ['replies', supabase.from('replies').delete().eq('user_id', userId)],
    ['threads', supabase.from('threads').delete().eq('user_id', userId)],
    ['journal_entries', supabase.from('journal_entries').delete().eq('user_id', userId)],
    ['match_requests', supabase.from('match_requests').delete().eq('user_id', userId)],
    ['page_views', supabase.from('page_views').delete().eq('user_id', userId)],
    ['direct_messages_from', supabase.from('direct_messages').delete().eq('from_user_id', userId)],
    ['direct_messages_to', supabase.from('direct_messages').delete().eq('to_user_id', userId)],
    ['user_follows_follower', supabase.from('user_follows').delete().eq('follower_id', userId)],
    ['user_follows_followed', supabase.from('user_follows').delete().eq('followed_id', userId)],
    ['blog_comments', supabase.from('blog_comments').delete().eq('user_id', userId)],
    ['shared_journeys', supabase.from('shared_journeys').delete().eq('user_id', userId)],
    // Profile last (most things reference it)
    ['profiles', supabase.from('profiles').delete().eq('id', userId)],
  ];

  for (const [table, query] of deletions) {
    try {
      const { error, count } = await query;
      results[table] = error ? { error: error.message } : { ok: true };
    } catch (err) {
      results[table] = { error: err.message };
    }
  }

  // Optionally delete the auth.users row
  if (deleteAuthUser) {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      results['auth.users'] = error ? { error: error.message } : { ok: true };
    } catch (err) {
      results['auth.users'] = { error: err.message };
    }
  }

  return NextResponse.json({ userId, results });
}
