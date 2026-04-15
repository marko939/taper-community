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
    const _t0 = Date.now();
    const results = await Promise.allSettled([
      fetchTopLineStats(supabase),
      fetchSignupSeries(supabase),
      fetchPeriodComparisons(supabase),
      fetchPeriodHistoricalSeries(supabase),
      fetchDailyActivity(supabase),
      fetchRetention(supabase),
      fetchEngagement(supabase),
      fetchForumBreakdown(supabase),
      fetchPeakHours(supabase),
      fetchTaperTracker(supabase),
      fetchNewVsReturning(supabase),
      fetchChurnRisk(supabase),
      fetchTopMembers(supabase),
      fetchThreadFunnel(supabase),
      fetchPageViews(supabase),
      fetchPlausibleStats(),
      fetchRetentionCohorts(supabase),
      fetchNewUsers(supabase),
    ]);

    const [
      topLine, signupSeries, periodComparisons, periodHistorical, dailyActivity,
      retention, engagement, forumBreakdown,
      peakHours, taperTracker, newVsReturning, churnRisk,
      topMembers, threadFunnel, pageViews, plausible, retentionCohorts,
      newUsers,
    ] = results.map(r => r.status === 'fulfilled' ? r.value : null);

    return NextResponse.json({
      topLine,
      signupSeries,
      periodComparisons,
      periodHistorical,
      dailyActivity,
      retention,
      engagement,
      forumBreakdown,
      peakHours,
      taperTracker,
      newVsReturning,
      churnRisk,
      topMembers,
      threadFunnel,
      pageViews,
      plausible,
      retentionCohorts,
      newUsers,
      fetchedAt: new Date().toISOString(),
      _responseTimeMs: Date.now() - _t0,
    });
  } catch (err) {
    console.error('Analytics fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

async function fetchTopLineStats(supabase) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [members, postsToday, commentsToday, threadUsers, replyUsers] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('threads').select('id', { count: 'exact', head: true }).gte('created_at', today),
    supabase.from('replies').select('id', { count: 'exact', head: true }).gte('created_at', today),
    // TODO: replace with RPC — aggregate unique active users in DB
    supabase.from('threads').select('user_id').gte('created_at', weekAgo).limit(500),
    supabase.from('replies').select('user_id').gte('created_at', weekAgo).limit(500),
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
      supabase.from('threads').select('user_id').gte('created_at', start.toISOString()).lt('created_at', end.toISOString()).limit(2000),
      supabase.from('replies').select('user_id').gte('created_at', start.toISOString()).lt('created_at', end.toISOString()).limit(2000),
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

async function fetchPeriodHistoricalSeries(supabase) {
  const now = new Date();

  // Helper: get start of week (Monday)
  function weekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.getFullYear(), d.getMonth(), diff);
  }

  // Daily: last 14 days
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
    const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    days.push({ start, end, label });
  }

  // Weekly: last 12 weeks
  const weeks = [];
  const ws = weekStart(now);
  for (let i = 11; i >= 0; i--) {
    const start = new Date(ws.getTime() - i * 7 * 86400000);
    const end = new Date(start.getTime() + 7 * 86400000);
    const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    weeks.push({ start, end, label });
  }

  // Monthly: last 12 months
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    months.push({ start, end, label });
  }

  // Quarterly: last 8 quarters
  const quarters = [];
  const curQ = Math.floor(now.getMonth() / 3);
  for (let i = 7; i >= 0; i--) {
    const qMonth = curQ * 3 - i * 3;
    const start = new Date(now.getFullYear(), now.getMonth() - (now.getMonth() % 3) - i * 3, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 3, 1);
    const qNum = Math.floor(start.getMonth() / 3) + 1;
    const label = `Q${qNum} ${start.getFullYear().toString().slice(2)}`;
    quarters.push({ start, end, label });
  }

  // Yearly: last 3 years
  const years = [];
  for (let i = 2; i >= 0; i--) {
    const start = new Date(now.getFullYear() - i, 0, 1);
    const end = new Date(now.getFullYear() - i + 1, 0, 1);
    const label = start.getFullYear().toString();
    years.push({ start, end, label });
  }

  // Fetch all raw data for the full range (covers yearly = 3 years back)
  const rangeStart = years[0].start.toISOString();
  const [allThreads, allReplies, allProfiles] = await Promise.all([
    supabase.from('threads').select('user_id, created_at').gte('created_at', rangeStart).limit(5000),
    supabase.from('replies').select('user_id, created_at').gte('created_at', rangeStart).limit(5000),
    supabase.from('profiles').select('id, joined_at').gte('joined_at', rangeStart).limit(5000),
  ]);

  function bucketize(buckets, threads, replies, profiles) {
    return buckets.map(b => {
      const s = b.start.getTime();
      const e = b.end.getTime();
      const bThreads = (threads.data || []).filter(t => { const ts = new Date(t.created_at).getTime(); return ts >= s && ts < e; });
      const bReplies = (replies.data || []).filter(r => { const ts = new Date(r.created_at).getTime(); return ts >= s && ts < e; });
      const bSignups = (profiles.data || []).filter(p => { const ts = new Date(p.joined_at).getTime(); return ts >= s && ts < e; });
      const activeSet = new Set([...bThreads.map(t => t.user_id), ...bReplies.map(r => r.user_id)]);
      return {
        label: b.label,
        signups: bSignups.length,
        posts: bThreads.length,
        comments: bReplies.length,
        active: activeSet.size,
      };
    });
  }

  return {
    daily: bucketize(days, allThreads, allReplies, allProfiles),
    weekly: bucketize(weeks, allThreads, allReplies, allProfiles),
    monthly: bucketize(months, allThreads, allReplies, allProfiles),
    quarterly: bucketize(quarters, allThreads, allReplies, allProfiles),
    yearly: bucketize(years, allThreads, allReplies, allProfiles),
  };
}

async function fetchDailyActivity(supabase) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const [threads, replies] = await Promise.all([
    supabase.from('threads').select('created_at').gte('created_at', thirtyDaysAgo).limit(2000),
    supabase.from('replies').select('created_at').gte('created_at', thirtyDaysAgo).limit(2000),
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

async function fetchRetention(supabase) {
  const { data } = await supabase.rpc('analytics_retention');
  if (!data) {
    const empty = { d1_pct: 0, d7_pct: 0, d30_pct: 0, d1_cohort: 0, d7_cohort: 0, d30_cohort: 0, d1_returned: 0, d7_returned: 0, d30_returned: 0 };
    return { current: empty, alltime: empty };
  }
  // Handle both old (flat) and new (nested) response shapes
  if (data.current) return data;
  return { current: data, alltime: data };
}

async function fetchRetentionCohorts(supabase) {
  const now = new Date();
  const weeksBack = 8;
  const cutoff = new Date(now - weeksBack * 7 * 86400000).toISOString();

  // Get all users who signed up in the last N weeks
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, joined_at')
    .gte('joined_at', cutoff)
    .limit(1000);

  if (!profiles || profiles.length === 0) return [];

  // Get all activity for these users — matches the retention SQL: page_views, threads, replies, votes, journal
  const userIds = profiles.map(p => p.id);
  const [threads, replies, pageViews, threadVotes, replyVotes, helpfulVotes, journalEntries] = await Promise.all([
    supabase.from('threads').select('user_id, created_at').in('user_id', userIds).gte('created_at', cutoff).limit(5000),
    supabase.from('replies').select('user_id, created_at').in('user_id', userIds).gte('created_at', cutoff).limit(5000),
    supabase.from('page_views').select('user_id, created_at').in('user_id', userIds).gte('created_at', cutoff).limit(5000),
    supabase.from('thread_votes').select('user_id, created_at').in('user_id', userIds).gte('created_at', cutoff).limit(5000),
    supabase.from('reply_votes').select('user_id, created_at').in('user_id', userIds).gte('created_at', cutoff).limit(5000),
    supabase.from('helpful_votes').select('user_id, created_at').in('user_id', userIds).gte('created_at', cutoff).limit(5000),
    supabase.from('journal_entries').select('user_id, created_at').in('user_id', userIds).gte('created_at', cutoff).limit(5000),
  ]);

  // Build activity map: userId -> set of week numbers (weeks since signup)
  const activityByUser = {};
  const allActivity = [
    ...(threads.data || []), ...(replies.data || []), ...(pageViews.data || []),
    ...(threadVotes.data || []), ...(replyVotes.data || []), ...(helpfulVotes.data || []),
    ...(journalEntries.data || []),
  ];
  const profileMap = {};
  for (const p of profiles) profileMap[p.id] = new Date(p.joined_at).getTime();

  for (const item of allActivity) {
    if (!item.user_id) continue;
    if (!activityByUser[item.user_id]) activityByUser[item.user_id] = new Set();
    const joinedMs = profileMap[item.user_id];
    if (!joinedMs) continue;
    const activityMs = new Date(item.created_at).getTime();
    const weekOffset = Math.floor((activityMs - joinedMs) / (7 * 86400000));
    if (weekOffset >= 0) activityByUser[item.user_id].add(weekOffset);
  }

  // Group users into weekly cohorts by signup week
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.getFullYear(), d.getMonth(), diff);
  };

  const cohortMap = {};
  for (const p of profiles) {
    const ws = getWeekStart(p.joined_at);
    const key = ws.toISOString().slice(0, 10);
    if (!cohortMap[key]) cohortMap[key] = { users: [], weekStart: ws };
    cohortMap[key].users.push(p.id);
  }

  // For each cohort, calculate retention % for each week
  const cohorts = Object.entries(cohortMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { users, weekStart }]) => {
      const size = users.length;
      const weeksElapsed = Math.floor((now - weekStart) / (7 * 86400000));
      const label = new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const weeks = {};
      for (let w = 0; w <= Math.min(weeksElapsed, weeksBack - 1); w++) {
        const retained = users.filter(uid => activityByUser[uid]?.has(w)).length;
        weeks[`week${w}`] = size > 0 ? Math.round((retained / size) * 100) : 0;
      }

      return { cohort: label, size, weeksElapsed, ...weeks };
    });

  return cohorts;
}

async function fetchEngagement(supabase) {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  // TODO: replace with RPC — aggregate engagement metrics in DB instead of fetching all rows
  const [weekThreads, weekReplies, monthThreads, profiles, allThreads, allReplies] = await Promise.all([
    supabase.from('threads').select('user_id').gte('created_at', weekAgo).limit(500),
    supabase.from('replies').select('user_id').gte('created_at', weekAgo).limit(500),
    supabase.from('threads').select('id, reply_count, created_at').gte('created_at', monthAgo).limit(500),
    supabase.from('profiles').select('id, joined_at').limit(500),
    supabase.from('threads').select('user_id, created_at').order('created_at', { ascending: true }).limit(500),
    supabase.from('replies').select('user_id, created_at').order('created_at', { ascending: true }).limit(500),
  ]);

  // Posts per active user
  const weekActiveUsers = new Set([
    ...(weekThreads.data || []).map(r => r.user_id),
    ...(weekReplies.data || []).map(r => r.user_id),
  ]);
  const postsPerActive = weekActiveUsers.size > 0
    ? ((weekThreads.data || []).length / weekActiveUsers.size).toFixed(1) : '0';

  // Avg replies per thread (threads with replies, 30d)
  const monthThreadData = monthThreads.data || [];
  const threadsWithRepliesData = monthThreadData.filter(t => t.reply_count > 0);
  const avgReplies = threadsWithRepliesData.length > 0
    ? (threadsWithRepliesData.reduce((s, t) => s + t.reply_count, 0) / threadsWithRepliesData.length).toFixed(1) : '0';

  // Time to first post or reply (earliest of first thread or first reply per user)
  const firstActivityByUser = {};
  for (const t of (allThreads.data || [])) {
    const ts = new Date(t.created_at).getTime();
    if (!firstActivityByUser[t.user_id] || ts < firstActivityByUser[t.user_id]) {
      firstActivityByUser[t.user_id] = ts;
    }
  }
  for (const r of (allReplies.data || [])) {
    const ts = new Date(r.created_at).getTime();
    if (!firstActivityByUser[r.user_id] || ts < firstActivityByUser[r.user_id]) {
      firstActivityByUser[r.user_id] = ts;
    }
  }

  const delays = [];
  for (const p of (profiles.data || [])) {
    if (firstActivityByUser[p.id]) {
      const hours = (firstActivityByUser[p.id] - new Date(p.joined_at).getTime()) / 3600000;
      if (hours >= 0) delays.push(hours);
    }
  }
  const avgTimeToFirstPostOrReply = delays.length > 0
    ? parseFloat((delays.reduce((s, v) => s + v, 0) / delays.length).toFixed(1)) : null;

  return {
    postsPerActiveUser: postsPerActive,
    avgRepliesPerThread: avgReplies,
    avgTimeToFirstPostOrReplyHours: avgTimeToFirstPostOrReply,
    usersWhoPosted: delays.length,
    totalUsers: (profiles.data || []).length,
  };
}

async function fetchForumBreakdown(supabase) {
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  // Get all threads with forum names
  const { data: threads } = await supabase
    .from('threads')
    .select('forum_id, forums(name)')
    .gte('created_at', monthAgo)
    .limit(500);

  const forumCounts = {};
  for (const t of (threads || [])) {
    const name = t.forums?.name || 'Unknown';
    forumCounts[name] = (forumCounts[name] || 0) + 1;
  }

  return Object.entries(forumCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

async function fetchTimeToFirstPost(supabase) {
  // TODO: replace with RPC — compute time-to-first-post in DB
  const { data: profiles } = await supabase.from('profiles').select('id, joined_at').limit(500);
  const { data: threads } = await supabase.from('threads').select('user_id, created_at').order('created_at', { ascending: true }).limit(500);

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

async function fetchPeakHours(supabase) {
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  // TODO: replace with RPC — aggregate hour distribution in DB
  const [threads, replies] = await Promise.all([
    supabase.from('threads').select('created_at').gte('created_at', monthAgo).limit(500),
    supabase.from('replies').select('created_at').gte('created_at', monthAgo).limit(500),
  ]);

  const hourCounts = new Array(24).fill(0);
  for (const item of [...(threads.data || []), ...(replies.data || [])]) {
    hourCounts[new Date(item.created_at).getUTCHours()]++;
  }

  return hourCounts.map((count, hour) => ({ hour, count }));
}

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

async function fetchNewVsReturning(supabase) {
  const dayAgo = new Date(Date.now() - 86400000).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [activeThreadUsers, activeReplyUsers, newProfiles] = await Promise.all([
    supabase.from('threads').select('user_id').gte('created_at', dayAgo).limit(1000),
    supabase.from('replies').select('user_id').gte('created_at', dayAgo).limit(1000),
    supabase.from('profiles').select('id').gte('joined_at', weekAgo).limit(1000),
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

async function fetchChurnRisk(supabase) {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();

  // TODO: replace with RPC — compute churn risk in DB
  const { data: profiles } = await supabase.from('profiles').select('id, joined_at').limit(500);
  const { data: allThreads } = await supabase.from('threads').select('user_id, created_at').limit(500);
  const { data: recentThreads } = await supabase.from('threads').select('user_id').gte('created_at', fourteenDaysAgo).limit(500);
  const { data: recentReplies } = await supabase.from('replies').select('user_id').gte('created_at', fourteenDaysAgo).limit(500);

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

async function fetchTopMembers(supabase) {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  // TODO: replace with RPC — aggregate top members in DB
  const [threads, replies] = await Promise.all([
    supabase.from('threads').select('user_id').gte('created_at', weekAgo).limit(500),
    supabase.from('replies').select('user_id').gte('created_at', weekAgo).limit(500),
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

  const { data: profiles } = await supabase // unbounded-ok: filtered by .in() with max 5 IDs
    .from('profiles')
    .select('id, display_name')
    .in('id', topIds.map(t => t.id));

  const nameMap = {};
  for (const p of (profiles || [])) nameMap[p.id] = p.display_name;

  return topIds.map(t => ({ ...t, name: nameMap[t.id] || 'Anonymous' }));
}

async function fetchThreadFunnel(supabase) {
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data: threads } = await supabase
    .from('threads')
    .select('reply_count')
    .gte('created_at', monthAgo)
    .limit(2000);

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
    supabase.from('page_views').select('session_id').gte('created_at', todayStart).limit(5000),
    supabase.from('page_views').select('session_id').gte('created_at', weekAgo).limit(5000),
  ]);
  const todayUnique = new Set((todaySessions.data || []).map(r => r.session_id).filter(Boolean)).size;
  const weekUnique = new Set((weekSessions.data || []).map(r => r.session_id).filter(Boolean)).size;

  // Top pages (last 7 days)
  const { data: recentViews } = await supabase
    .from('page_views')
    .select('path')
    .gte('created_at', weekAgo)
    .limit(5000);

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
    .neq('referrer', '')
    .limit(5000);

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

  // Daily page views (last 30 days) — fill all 30 days so the chart isn't sparse
  const { data: dailyViews } = await supabase
    .from('page_views')
    .select('created_at')
    .gte('created_at', monthAgo)
    .limit(5000);

  const dayMap = {};
  for (const v of (dailyViews || [])) {
    const d = v.created_at.slice(0, 10);
    dayMap[d] = (dayMap[d] || 0) + 1;
  }
  // Build full 30-day series (always show all days, even zeros)
  const dailySeries = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    dailySeries.push({ date: key, views: dayMap[key] || 0 });
  }

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

const PLAUSIBLE_API = 'https://plausible.io/api/v1/stats';
const PLAUSIBLE_KEY = process.env.PLAUSIBLE_API_KEY;
const PLAUSIBLE_SITE = process.env.PLAUSIBLE_SITE_ID || 'taper.community';

async function plausibleFetch(endpoint, params = {}) {
  const url = new URL(`${PLAUSIBLE_API}/${endpoint}`);
  url.searchParams.set('site_id', PLAUSIBLE_SITE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${PLAUSIBLE_KEY}` },
  });
  if (!res.ok) throw new Error(`Plausible ${endpoint}: ${res.status}`);
  return res.json();
}

async function fetchPlausibleStats() {
  if (!PLAUSIBLE_KEY) return null;

  const labels = ['realtime', 'today', 'week', 'month', 'timeseries', 'topPages', 'topSources', 'topCountries'];
  const results = await Promise.allSettled([
    plausibleFetch('realtime/visitors'),
    plausibleFetch('aggregate', { period: 'day', metrics: 'visitors,pageviews,bounce_rate,visit_duration' }),
    plausibleFetch('aggregate', { period: '7d', metrics: 'visitors,pageviews,bounce_rate,visit_duration' }),
    plausibleFetch('aggregate', { period: '30d', metrics: 'visitors,pageviews,bounce_rate,visit_duration' }),
    plausibleFetch('timeseries', { period: '30d', metrics: 'visitors,pageviews' }),
    plausibleFetch('breakdown', { period: '7d', property: 'event:page', metrics: 'visitors,pageviews', limit: '10' }),
    plausibleFetch('breakdown', { period: '7d', property: 'visit:source', metrics: 'visitors', limit: '10' }),
    plausibleFetch('breakdown', { period: '7d', property: 'visit:country', metrics: 'visitors', limit: '10' }),
  ]);

  const values = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    console.error(`Plausible ${labels[i]} failed:`, r.reason?.message || r.reason);
    return null;
  });
  const [realtime, today, week, month, timeseries, topPages, topSources, topCountries] = values;

  const errors = results
    .map((r, i) => r.status === 'rejected' ? labels[i] : null)
    .filter(Boolean);

  return {
    realtime,
    today: today?.results ?? null,
    week: week?.results ?? null,
    month: month?.results ?? null,
    timeseries: timeseries?.results ?? null,
    topPages: topPages?.results ?? null,
    topSources: topSources?.results ?? null,
    topCountries: topCountries?.results ?? null,
    _errors: errors.length > 0 ? errors : undefined,
  };
}

async function fetchNewUsers(supabase) {
  const [profilesRes, matchRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, display_name, avatar_url, drug, taper_stage, has_clinician, drug_signature, location, joined_at, email, ip_location, last_ip')
      .order('joined_at', { ascending: false })
      .limit(500),
    supabase
      .from('match_requests')
      .select('user_id')
      .not('user_id', 'is', null)
      .limit(500),
  ]);

  const users = profilesRes.data || [];
  const matchRequestUserIds = [...new Set((matchRes.data || []).map(r => r.user_id))];

  return { users, matchRequestUserIds };
}
