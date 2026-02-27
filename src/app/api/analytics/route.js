import { createClient as createAuthClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/blog';

export const dynamic = 'force-dynamic';

// Service role client — bypasses RLS, used for all analytics queries
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export async function GET() {
  // Auth check using cookie-based client
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || !isAdmin(user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role client for all data queries
  const supabase = getServiceClient();

  try {
    const results = await Promise.allSettled([
      fetchTopLineStats(supabase),
      fetchSignupSeries(supabase),
      fetchPeriodComparisons(supabase),
      fetchDailyActivity(supabase),
      fetchRetention(supabase),
      fetchEngagement(supabase),
      fetchForumBreakdown(supabase),
      fetchTimeToFirstPost(supabase),
      fetchPeakHours(supabase),
      fetchTaperTracker(supabase),
      fetchNewVsReturning(supabase),
      fetchChurnRisk(supabase),
      fetchTopMembers(supabase),
      fetchThreadFunnel(supabase),
      fetchPageViews(supabase),
    ]);

    const [
      topLine, signupSeries, periodComparisons, dailyActivity,
      retention, engagement, forumBreakdown, timeToFirstPost,
      peakHours, taperTracker, newVsReturning, churnRisk,
      topMembers, threadFunnel, pageViews,
    ] = results.map(r => r.status === 'fulfilled' ? r.value : null);

    return NextResponse.json({
      topLine,
      signupSeries,
      periodComparisons,
      dailyActivity,
      retention,
      engagement,
      forumBreakdown,
      timeToFirstPost,
      peakHours,
      taperTracker,
      newVsReturning,
      churnRisk,
      topMembers,
      threadFunnel,
      pageViews,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Analytics fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

// ── Section 1: Top Line Stats ──
async function fetchTopLineStats(supabase) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [members, postsToday, commentsToday, threadUsers, replyUsers] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('threads').select('id', { count: 'exact', head: true }).gte('created_at', today),
    supabase.from('replies').select('id', { count: 'exact', head: true }).gte('created_at', today),
    supabase.from('threads').select('user_id').gte('created_at', weekAgo),
    supabase.from('replies').select('user_id').gte('created_at', weekAgo),
  ]);

  const uniqueActive = new Set([
    ...(threadUsers.data || []).map(r => r.user_id),
    ...(replyUsers.data || []).map(r => r.user_id),
  ]);

  // Journal stats via RPC
  const { data: journalStats } = await supabase.rpc('analytics_journal_stats');

  return {
    totalMembers: members.count || 0,
    postsToday: postsToday.count || 0,
    commentsToday: commentsToday.count || 0,
    activeThisWeek: uniqueActive.size,
    taperTrackersActive: journalStats?.users_with_entries || 0,
  };
}

// ── Section 2: Signup Growth Series ──
async function fetchSignupSeries(supabase) {
  const [d7, d30, d90] = await Promise.all([
    supabase.rpc('analytics_signup_series', { days_back: 7 }),
    supabase.rpc('analytics_signup_series', { days_back: 30 }),
    supabase.rpc('analytics_signup_series', { days_back: 90 }),
  ]);

  return {
    last7: d7.data || [],
    last30: d30.data || [],
    last90: d90.data || [],
  };
}

// ── Section 3: Period Comparisons ──
async function fetchPeriodComparisons(supabase) {
  const now = new Date();

  async function countInRange(table, start, end) {
    const { count } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString());
    return count || 0;
  }

  async function countSignupsInRange(start, end) {
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('joined_at', start.toISOString())
      .lt('joined_at', end.toISOString());
    return count || 0;
  }

  async function activeUsersInRange(start, end) {
    const [threadUsers, replyUsers] = await Promise.all([
      supabase.from('threads').select('user_id').gte('created_at', start.toISOString()).lt('created_at', end.toISOString()),
      supabase.from('replies').select('user_id').gte('created_at', start.toISOString()).lt('created_at', end.toISOString()),
    ]);
    const unique = new Set([
      ...(threadUsers.data || []).map(r => r.user_id),
      ...(replyUsers.data || []).map(r => r.user_id),
    ]);
    return unique.size;
  }

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart - 86400000);
  const thisWeekStart = getStartOfWeek(now);
  const lastWeekStart = new Date(thisWeekStart - 7 * 86400000);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const lastQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1);
  const thisYearStart = new Date(now.getFullYear(), 0, 1);
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const lastYearEnd = new Date(now.getFullYear(), 0, 1);

  const [
    todaySignups, yesterdaySignups, todayPosts, yesterdayPosts,
    todayComments, yesterdayComments, todayActive, yesterdayActive,
    thisWeekSignups, lastWeekSignups, thisWeekPosts, lastWeekPosts,
    thisWeekComments, lastWeekComments, thisWeekActive, lastWeekActive,
    thisMonthSignups, lastMonthSignups, thisMonthPosts, lastMonthPosts,
    thisMonthComments, lastMonthComments, thisMonthActive, lastMonthActive,
    thisQuarterSignups, lastQuarterSignups, thisQuarterPosts, lastQuarterPosts,
    thisQuarterComments, lastQuarterComments,
    thisYearSignups, lastYearSignups, thisYearPosts, lastYearPosts,
    thisYearComments, lastYearComments,
  ] = await Promise.all([
    countSignupsInRange(todayStart, now), countSignupsInRange(yesterdayStart, todayStart),
    countInRange('threads', todayStart, now), countInRange('threads', yesterdayStart, todayStart),
    countInRange('replies', todayStart, now), countInRange('replies', yesterdayStart, todayStart),
    activeUsersInRange(todayStart, now), activeUsersInRange(yesterdayStart, todayStart),
    countSignupsInRange(thisWeekStart, now), countSignupsInRange(lastWeekStart, thisWeekStart),
    countInRange('threads', thisWeekStart, now), countInRange('threads', lastWeekStart, thisWeekStart),
    countInRange('replies', thisWeekStart, now), countInRange('replies', lastWeekStart, thisWeekStart),
    activeUsersInRange(thisWeekStart, now), activeUsersInRange(lastWeekStart, thisWeekStart),
    countSignupsInRange(thisMonthStart, now), countSignupsInRange(lastMonthStart, thisMonthStart),
    countInRange('threads', thisMonthStart, now), countInRange('threads', lastMonthStart, thisMonthStart),
    countInRange('replies', thisMonthStart, now), countInRange('replies', lastMonthStart, thisMonthStart),
    activeUsersInRange(thisMonthStart, now), activeUsersInRange(lastMonthStart, thisMonthStart),
    countSignupsInRange(thisQuarterStart, now), countSignupsInRange(lastQuarterStart, thisQuarterStart),
    countInRange('threads', thisQuarterStart, now), countInRange('threads', lastQuarterStart, thisQuarterStart),
    countInRange('replies', thisQuarterStart, now), countInRange('replies', lastQuarterStart, thisQuarterStart),
    countSignupsInRange(thisYearStart, now), countSignupsInRange(lastYearStart, lastYearEnd),
    countInRange('threads', thisYearStart, now), countInRange('threads', lastYearStart, lastYearEnd),
    countInRange('replies', thisYearStart, now), countInRange('replies', lastYearStart, lastYearEnd),
  ]);

  function pctChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  return {
    daily: {
      signups: { current: todaySignups, previous: yesterdaySignups, change: pctChange(todaySignups, yesterdaySignups) },
      posts: { current: todayPosts, previous: yesterdayPosts, change: pctChange(todayPosts, yesterdayPosts) },
      comments: { current: todayComments, previous: yesterdayComments, change: pctChange(todayComments, yesterdayComments) },
      active: { current: todayActive, previous: yesterdayActive, change: pctChange(todayActive, yesterdayActive) },
    },
    weekly: {
      signups: { current: thisWeekSignups, previous: lastWeekSignups, change: pctChange(thisWeekSignups, lastWeekSignups) },
      posts: { current: thisWeekPosts, previous: lastWeekPosts, change: pctChange(thisWeekPosts, lastWeekPosts) },
      comments: { current: thisWeekComments, previous: lastWeekComments, change: pctChange(thisWeekComments, lastWeekComments) },
      active: { current: thisWeekActive, previous: lastWeekActive, change: pctChange(thisWeekActive, lastWeekActive) },
    },
    monthly: {
      signups: { current: thisMonthSignups, previous: lastMonthSignups, change: pctChange(thisMonthSignups, lastMonthSignups) },
      posts: { current: thisMonthPosts, previous: lastMonthPosts, change: pctChange(thisMonthPosts, lastMonthPosts) },
      comments: { current: thisMonthComments, previous: lastMonthComments, change: pctChange(thisMonthComments, lastMonthComments) },
      active: { current: thisMonthActive, previous: lastMonthActive, change: pctChange(thisMonthActive, lastMonthActive) },
    },
    quarterly: {
      signups: { current: thisQuarterSignups, previous: lastQuarterSignups, change: pctChange(thisQuarterSignups, lastQuarterSignups) },
      posts: { current: thisQuarterPosts, previous: lastQuarterPosts, change: pctChange(thisQuarterPosts, lastQuarterPosts) },
      comments: { current: thisQuarterComments, previous: lastQuarterComments, change: pctChange(thisQuarterComments, lastQuarterComments) },
    },
    yearly: {
      signups: { current: thisYearSignups, previous: lastYearSignups, change: pctChange(thisYearSignups, lastYearSignups) },
      posts: { current: thisYearPosts, previous: lastYearPosts, change: pctChange(thisYearPosts, lastYearPosts) },
      comments: { current: thisYearComments, previous: lastYearComments, change: pctChange(thisYearComments, lastYearComments) },
    },
  };
}

// ── Section 4: Daily Activity ──
async function fetchDailyActivity(supabase) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const [threads, replies] = await Promise.all([
    supabase.from('threads').select('created_at').gte('created_at', thirtyDaysAgo),
    supabase.from('replies').select('created_at').gte('created_at', thirtyDaysAgo),
  ]);

  const dayMap = {};
  for (const t of (threads.data || [])) {
    const d = t.created_at.slice(0, 10);
    if (!dayMap[d]) dayMap[d] = { date: d, posts: 0, comments: 0 };
    dayMap[d].posts++;
  }
  for (const r of (replies.data || [])) {
    const d = r.created_at.slice(0, 10);
    if (!dayMap[d]) dayMap[d] = { date: d, posts: 0, comments: 0 };
    dayMap[d].comments++;
  }

  return Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));
}

// ── Section 5: Retention ──
async function fetchRetention(supabase) {
  const { data } = await supabase.rpc('analytics_retention');
  return data || { d1_pct: 0, d7_pct: 0, d30_pct: 0, d1_cohort: 0, d7_cohort: 0, d30_cohort: 0 };
}

// ── Section 6: Engagement ──
async function fetchEngagement(supabase) {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const [weekThreads, weekReplies, monthThreads, monthReplies] = await Promise.all([
    supabase.from('threads').select('user_id').gte('created_at', weekAgo),
    supabase.from('replies').select('user_id').gte('created_at', weekAgo),
    supabase.from('threads').select('id, reply_count, created_at').gte('created_at', monthAgo),
    supabase.from('replies').select('thread_id, created_at').gte('created_at', monthAgo),
  ]);

  const weekActiveUsers = new Set([
    ...(weekThreads.data || []).map(r => r.user_id),
    ...(weekReplies.data || []).map(r => r.user_id),
  ]);
  const postsPerActive = weekActiveUsers.size > 0
    ? ((weekThreads.data || []).length / weekActiveUsers.size).toFixed(1) : '0';

  const monthThreadData = monthThreads.data || [];
  const threadsWithReplies = monthThreadData.filter(t => t.reply_count > 0).length;
  const replyRate = monthThreadData.length > 0
    ? Math.round((threadsWithReplies / monthThreadData.length) * 100) : 0;

  const threadsWithRepliesData = monthThreadData.filter(t => t.reply_count > 0);
  const avgReplies = threadsWithRepliesData.length > 0
    ? (threadsWithRepliesData.reduce((s, t) => s + t.reply_count, 0) / threadsWithRepliesData.length).toFixed(1) : '0';

  const threadCreatedMap = {};
  for (const t of monthThreadData) threadCreatedMap[t.id] = new Date(t.created_at).getTime();
  const firstReplyByThread = {};
  for (const r of (monthReplies.data || [])) {
    const rt = new Date(r.created_at).getTime();
    if (!firstReplyByThread[r.thread_id] || rt < firstReplyByThread[r.thread_id]) firstReplyByThread[r.thread_id] = rt;
  }
  const replyDelays = [];
  for (const [tid, fr] of Object.entries(firstReplyByThread)) {
    if (threadCreatedMap[tid]) replyDelays.push((fr - threadCreatedMap[tid]) / 3600000);
  }
  const avgTimeToFirstReply = replyDelays.length > 0
    ? (replyDelays.reduce((s, v) => s + v, 0) / replyDelays.length).toFixed(1) : null;

  return { postsPerActiveUser: postsPerActive, replyRate, avgRepliesPerThread: avgReplies, avgTimeToFirstReplyHours: avgTimeToFirstReply };
}

// ── Section 7: Forum Breakdown ──
async function fetchForumBreakdown(supabase) {
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  // Get all threads with forum names
  const { data: threads } = await supabase
    .from('threads')
    .select('forum_id, forums(name)')
    .gte('created_at', monthAgo);

  const forumCounts = {};
  for (const t of (threads || [])) {
    const name = t.forums?.name || 'Unknown';
    forumCounts[name] = (forumCounts[name] || 0) + 1;
  }

  return Object.entries(forumCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// ── Section 8: Time to First Post ──
async function fetchTimeToFirstPost(supabase) {
  const { data: profiles } = await supabase.from('profiles').select('id, joined_at');
  const { data: threads } = await supabase.from('threads').select('user_id, created_at').order('created_at', { ascending: true });

  const firstPostByUser = {};
  for (const t of (threads || [])) {
    if (!firstPostByUser[t.user_id]) firstPostByUser[t.user_id] = new Date(t.created_at).getTime();
  }

  const delays = [];
  for (const p of (profiles || [])) {
    if (firstPostByUser[p.id]) {
      const hours = (firstPostByUser[p.id] - new Date(p.joined_at).getTime()) / 3600000;
      if (hours >= 0) delays.push(hours);
    }
  }

  return {
    avgHours: delays.length > 0 ? parseFloat((delays.reduce((s, v) => s + v, 0) / delays.length).toFixed(1)) : null,
    usersWhoPosted: delays.length,
    totalUsers: (profiles || []).length,
  };
}

// ── Section 9: Peak Hours ──
async function fetchPeakHours(supabase) {
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const [threads, replies] = await Promise.all([
    supabase.from('threads').select('created_at').gte('created_at', monthAgo),
    supabase.from('replies').select('created_at').gte('created_at', monthAgo),
  ]);

  const hourCounts = new Array(24).fill(0);
  for (const item of [...(threads.data || []), ...(replies.data || [])]) {
    hourCounts[new Date(item.created_at).getUTCHours()]++;
  }

  return hourCounts.map((count, hour) => ({ hour, count }));
}

// ── Section 10: Taper Tracker ──
async function fetchTaperTracker(supabase) {
  const { data: journalStats } = await supabase.rpc('analytics_journal_stats');
  const { count: totalMembers } = await supabase.from('profiles').select('id', { count: 'exact', head: true });

  return {
    usersWithEntries: journalStats?.users_with_entries || 0,
    totalMembers: totalMembers || 0,
    adoptionPct: totalMembers > 0 ? Math.round(((journalStats?.users_with_entries || 0) / totalMembers) * 100) : 0,
    checkinsToday: journalStats?.checkins_today || 0,
    checkinsThisWeek: journalStats?.checkins_this_week || 0,
    checkinsThisMonth: journalStats?.checkins_this_month || 0,
    avgCheckinsPerUserPerWeek: journalStats?.avg_checkins_per_user_per_week || 0,
  };
}

// ── NEW: New vs Returning Active Users ──
async function fetchNewVsReturning(supabase) {
  const dayAgo = new Date(Date.now() - 86400000).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [activeThreadUsers, activeReplyUsers, newProfiles] = await Promise.all([
    supabase.from('threads').select('user_id').gte('created_at', dayAgo),
    supabase.from('replies').select('user_id').gte('created_at', dayAgo),
    supabase.from('profiles').select('id').gte('joined_at', weekAgo),
  ]);

  const activeIds = new Set([
    ...(activeThreadUsers.data || []).map(r => r.user_id),
    ...(activeReplyUsers.data || []).map(r => r.user_id),
  ]);
  const newIds = new Set((newProfiles.data || []).map(r => r.id));

  let newActive = 0, returningActive = 0;
  for (const id of activeIds) {
    if (newIds.has(id)) newActive++;
    else returningActive++;
  }

  return { newActive, returningActive };
}

// ── NEW: Churn Risk ──
async function fetchChurnRisk(supabase) {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();

  // All users who posted a thread in their first 7 days
  const { data: profiles } = await supabase.from('profiles').select('id, joined_at');
  const { data: allThreads } = await supabase.from('threads').select('user_id, created_at');
  const { data: recentThreads } = await supabase.from('threads').select('user_id').gte('created_at', fourteenDaysAgo);
  const { data: recentReplies } = await supabase.from('replies').select('user_id').gte('created_at', fourteenDaysAgo);

  const recentActive = new Set([
    ...(recentThreads || []).map(r => r.user_id),
    ...(recentReplies || []).map(r => r.user_id),
  ]);

  const profileMap = {};
  for (const p of (profiles || [])) profileMap[p.id] = new Date(p.joined_at).getTime();

  const firstWeekPosters = new Set();
  for (const t of (allThreads || [])) {
    const joinedAt = profileMap[t.user_id];
    if (joinedAt && (new Date(t.created_at).getTime() - joinedAt) < 7 * 86400000) {
      firstWeekPosters.add(t.user_id);
    }
  }

  let atRisk = 0;
  for (const userId of firstWeekPosters) {
    if (!recentActive.has(userId)) atRisk++;
  }

  return { atRisk, firstWeekPosters: firstWeekPosters.size };
}

// ── NEW: Top Members This Week ──
async function fetchTopMembers(supabase) {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [threads, replies] = await Promise.all([
    supabase.from('threads').select('user_id').gte('created_at', weekAgo),
    supabase.from('replies').select('user_id').gte('created_at', weekAgo),
  ]);

  const activity = {};
  for (const t of (threads.data || [])) {
    if (!activity[t.user_id]) activity[t.user_id] = { posts: 0, comments: 0 };
    activity[t.user_id].posts++;
  }
  for (const r of (replies.data || [])) {
    if (!activity[r.user_id]) activity[r.user_id] = { posts: 0, comments: 0 };
    activity[r.user_id].comments++;
  }

  const topIds = Object.entries(activity)
    .map(([id, a]) => ({ id, ...a, total: a.posts + a.comments }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  if (topIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', topIds.map(t => t.id));

  const nameMap = {};
  for (const p of (profiles || [])) nameMap[p.id] = p.display_name;

  return topIds.map(t => ({ ...t, name: nameMap[t.id] || 'Anonymous' }));
}

// ── NEW: Thread Engagement Funnel ──
async function fetchThreadFunnel(supabase) {
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data: threads } = await supabase
    .from('threads')
    .select('reply_count')
    .gte('created_at', monthAgo);

  const all = threads || [];
  const total = all.length;

  return {
    total,
    got1: all.filter(t => t.reply_count >= 1).length,
    got3: all.filter(t => t.reply_count >= 3).length,
    got5: all.filter(t => t.reply_count >= 5).length,
    got10: all.filter(t => t.reply_count >= 10).length,
  };
}

// ── NEW: Page Views ──
async function fetchPageViews(supabase) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const [todayViews, weekViews, monthViews] = await Promise.all([
    supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
    supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', monthAgo),
  ]);

  // Unique visitors (by session_id)
  const [todaySessions, weekSessions] = await Promise.all([
    supabase.from('page_views').select('session_id').gte('created_at', todayStart),
    supabase.from('page_views').select('session_id').gte('created_at', weekAgo),
  ]);
  const todayUnique = new Set((todaySessions.data || []).map(r => r.session_id).filter(Boolean)).size;
  const weekUnique = new Set((weekSessions.data || []).map(r => r.session_id).filter(Boolean)).size;

  // Top pages (last 7 days)
  const { data: recentViews } = await supabase
    .from('page_views')
    .select('path')
    .gte('created_at', weekAgo);

  const pathCounts = {};
  for (const v of (recentViews || [])) {
    pathCounts[v.path] = (pathCounts[v.path] || 0) + 1;
  }
  const topPages = Object.entries(pathCounts)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Top referrers (last 7 days)
  const { data: refViews } = await supabase
    .from('page_views')
    .select('referrer')
    .gte('created_at', weekAgo)
    .not('referrer', 'is', null)
    .neq('referrer', '');

  const refCounts = {};
  for (const v of (refViews || [])) {
    try {
      const host = new URL(v.referrer).hostname;
      if (!host.includes('taper.community') && !host.includes('localhost')) {
        refCounts[host] = (refCounts[host] || 0) + 1;
      }
    } catch { /* skip invalid URLs */ }
  }
  const topReferrers = Object.entries(refCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Daily page views (last 30 days)
  const { data: dailyViews } = await supabase
    .from('page_views')
    .select('created_at')
    .gte('created_at', monthAgo);

  const dayMap = {};
  for (const v of (dailyViews || [])) {
    const d = v.created_at.slice(0, 10);
    dayMap[d] = (dayMap[d] || 0) + 1;
  }
  const dailySeries = Object.entries(dayMap)
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    today: todayViews.count || 0,
    thisWeek: weekViews.count || 0,
    thisMonth: monthViews.count || 0,
    uniqueToday: todayUnique,
    uniqueThisWeek: weekUnique,
    topPages,
    topReferrers,
    dailySeries,
  };
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}
