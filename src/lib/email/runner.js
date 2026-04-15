import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './resend';
import { hasReceivedEmailToday, hasReceivedEmailType, logEmail } from './throttle';
import { DailyDigestEmail } from './templates/daily-digest';
import { TaperReminderEmail } from './templates/taper-reminder';
import { IntroduceYourselfEmail } from './templates/introduce-yourself';
import { WeMissYouEmail } from './templates/we-miss-you';
import { ForumNewPostEmail } from './templates/forum-new-post';
import { WelcomeEmail } from './templates/welcome';
import { Day3JournalEmail } from './templates/day3-journal';
import { Day7ForumsEmail } from './templates/day7-forums';
import { Day14DeprescriberEmail } from './templates/day14-deprescriber';
import { Day30ReengageEmail } from './templates/day30-reengage';
import React from 'react';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export async function runEmailJobs() {
  console.log('[email] starting daily email run:', new Date().toISOString());
  const sentToday = new Set();

  // Priority order: welcome > day3 > day7 > day14 > digest > forum follows > introduce yourself > we miss you > taper reminder
  await runWelcome(sentToday);
  await runDay3Journal(sentToday);
  await runDay7Forums(sentToday);
  await runDay14Deprescriber(sentToday);
  await runDay30Reengage(sentToday);
  await runDigest(sentToday);
  await runForumFollowDigest(sentToday);
  await runIntroduceYourself(sentToday);
  await runWeMissYou(sentToday);
  await runTaperReminder(sentToday);

  console.log('[email] run complete. Emails sent to', sentToday.size, 'users');
}

async function runWelcome(sentToday) {
  const supabase = getServiceClient();

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Find users created in the last 24h
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, display_name, email_notifications, created_at')
    .gte('created_at', twentyFourHoursAgo)
    .not('email', 'is', null);

  if (!users || users.length === 0) return;

  for (const user of users) {
    if (sentToday.has(user.id)) continue;
    if (await hasReceivedEmailType(user.id, 'welcome', 365)) continue; // only once ever

    const result = await sendEmail({
      to: user.email,
      subject: 'Welcome to TaperCommunity — here\'s how to get started',
      react: React.createElement(WelcomeEmail, {
        userName: user.display_name || 'there',
      }),
    });

    if (result.success) {
      await logEmail(user.id, 'welcome');
      sentToday.add(user.id);
      console.log('[email] welcome sent to', user.email);
    }
  }
}

async function runDay3Journal(sentToday) {
  const supabase = getServiceClient();

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();

  // Users created 3-4 days ago
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, display_name, email_notifications, created_at')
    .lte('created_at', threeDaysAgo)
    .gte('created_at', fourDaysAgo)
    .eq('email_notifications', true)
    .not('email', 'is', null);

  if (!users || users.length === 0) return;

  for (const user of users) {
    if (sentToday.has(user.id)) continue;
    if (await hasReceivedEmailToday(user.id)) continue;
    if (await hasReceivedEmailType(user.id, 'day3_journal', 365)) continue;

    // Skip if they already have journal entries
    const { count } = await supabase
      .from('journal_entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((count || 0) > 0) continue;

    const result = await sendEmail({
      to: user.email,
      subject: 'Set up your taper journal — document and share your progress',
      react: React.createElement(Day3JournalEmail, {
        userName: user.display_name || 'there',
      }),
    });

    if (result.success) {
      await logEmail(user.id, 'day3_journal');
      sentToday.add(user.id);
      console.log('[email] day3-journal sent to', user.email);
    }
  }
}

async function runDay7Forums(sentToday) {
  const supabase = getServiceClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();

  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, display_name, email_notifications, created_at')
    .lte('created_at', sevenDaysAgo)
    .gte('created_at', eightDaysAgo)
    .eq('email_notifications', true)
    .not('email', 'is', null);

  if (!users || users.length === 0) return;

  for (const user of users) {
    if (sentToday.has(user.id)) continue;
    if (await hasReceivedEmailToday(user.id)) continue;
    if (await hasReceivedEmailType(user.id, 'day7_forums', 365)) continue;

    // Try to find their drug from journal entries
    let drugForumName = null;
    let drugForumUrl = null;

    const { data: entry } = await supabase
      .from('journal_entries')
      .select('drug')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (entry?.drug) {
      const slug = entry.drug.toLowerCase().replace(/\s+/g, '-');
      drugForumName = entry.drug;
      drugForumUrl = `${siteUrl}/forums/${slug}`;
    }

    const result = await sendEmail({
      to: user.email,
      subject: drugForumName
        ? `Connect with others tapering ${drugForumName}`
        : 'Explore the TaperCommunity forums',
      react: React.createElement(Day7ForumsEmail, {
        userName: user.display_name || 'there',
        drugForumName,
        drugForumUrl,
      }),
    });

    if (result.success) {
      await logEmail(user.id, 'day7_forums');
      sentToday.add(user.id);
      console.log('[email] day7-forums sent to', user.email);
    }
  }
}

async function runDay14Deprescriber(sentToday) {
  const supabase = getServiceClient();

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();

  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, display_name, email_notifications, created_at')
    .lte('created_at', fourteenDaysAgo)
    .gte('created_at', fifteenDaysAgo)
    .eq('email_notifications', true)
    .not('email', 'is', null);

  if (!users || users.length === 0) return;

  for (const user of users) {
    if (sentToday.has(user.id)) continue;
    if (await hasReceivedEmailToday(user.id)) continue;
    if (await hasReceivedEmailType(user.id, 'day14_deprescriber', 365)) continue;

    const result = await sendEmail({
      to: user.email,
      subject: 'Find a deprescriber who gets it',
      react: React.createElement(Day14DeprescriberEmail, {
        userName: user.display_name || 'there',
      }),
    });

    if (result.success) {
      await logEmail(user.id, 'day14_deprescriber');
      sentToday.add(user.id);
      console.log('[email] day14-deprescriber sent to', user.email);
    }
  }
}

async function runDay30Reengage(sentToday) {
  const supabase = getServiceClient();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();

  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, display_name, email_notifications, created_at')
    .lte('created_at', thirtyDaysAgo)
    .gte('created_at', thirtyOneDaysAgo)
    .eq('email_notifications', true)
    .not('email', 'is', null);

  if (!users || users.length === 0) return;

  for (const user of users) {
    if (sentToday.has(user.id)) continue;
    if (await hasReceivedEmailToday(user.id)) continue;
    if (await hasReceivedEmailType(user.id, 'day30_reengage', 365)) continue;

    // Skip if they've ever posted a thread or reply
    const { count: threadCount } = await supabase
      .from('threads')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: replyCount } = await supabase
      .from('replies')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((threadCount || 0) > 0 || (replyCount || 0) > 0) continue;

    const result = await sendEmail({
      to: user.email,
      subject: 'The community has grown — come back when you\'re ready',
      react: React.createElement(Day30ReengageEmail, {
        userName: user.display_name || 'there',
      }),
    });

    if (result.success) {
      await logEmail(user.id, 'day30_reengage');
      sentToday.add(user.id);
      console.log('[email] day30-reengage sent to', user.email);
    }
  }
}

async function runDigest(sentToday) {
  const supabase = getServiceClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  // Find replies from last 24h, grouped by thread owner
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: recentReplies } = await supabase
    .from('replies')
    .select('id, body, thread_id, user_id, threads:thread_id(user_id, title), profiles:user_id(display_name)')
    .gte('created_at', twentyFourHoursAgo);

  if (!recentReplies || recentReplies.length === 0) return;

  // Group by thread owner (the person who should get the digest)
  const byRecipient = {};
  for (const reply of recentReplies) {
    const threadOwnerId = reply.threads?.user_id;
    if (!threadOwnerId || threadOwnerId === reply.user_id) continue; // skip self-replies

    if (!byRecipient[threadOwnerId]) byRecipient[threadOwnerId] = [];
    byRecipient[threadOwnerId].push({
      authorName: reply.profiles?.display_name || 'Someone',
      threadTitle: reply.threads?.title || 'a thread',
      threadUrl: `${siteUrl}/thread/${reply.thread_id}#reply-${reply.id}`,
      preview: (reply.body || '').slice(0, 150),
    });
  }

  // Also include replies to threads where the user has commented (not just authored)
  const { data: participantReplies } = await supabase
    .from('replies')
    .select('id, body, thread_id, user_id, created_at, threads:thread_id(user_id, title), profiles:user_id(display_name)')
    .gte('created_at', twentyFourHoursAgo);

  if (participantReplies) {
    // Get all thread_ids with recent replies
    const threadIds = [...new Set(participantReplies.map((r) => r.thread_id))];

    // For each thread, find other participants who replied before
    for (const threadId of threadIds) {
      const { data: priorRepliers } = await supabase
        .from('replies')
        .select('user_id')
        .eq('thread_id', threadId)
        .lt('created_at', twentyFourHoursAgo);

      if (!priorRepliers) continue;
      const priorUserIds = new Set(priorRepliers.map((r) => r.user_id));

      const newRepliesInThread = participantReplies.filter((r) => r.thread_id === threadId);
      for (const reply of newRepliesInThread) {
        for (const priorUserId of priorUserIds) {
          if (priorUserId === reply.user_id) continue; // don't notify self
          if (!byRecipient[priorUserId]) byRecipient[priorUserId] = [];
          // Avoid duplicate entries
          if (!byRecipient[priorUserId].some((r) => r.threadUrl.includes(reply.id))) {
            byRecipient[priorUserId].push({
              authorName: reply.profiles?.display_name || 'Someone',
              threadTitle: reply.threads?.title || 'a thread',
              threadUrl: `${siteUrl}/thread/${reply.thread_id}#reply-${reply.id}`,
              preview: (reply.body || '').slice(0, 150),
            });
          }
        }
      }
    }
  }

  for (const [userId, replies] of Object.entries(byRecipient)) {
    if (sentToday.has(userId)) continue;
    if (await hasReceivedEmailToday(userId)) continue;

    // Check user preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, display_name, email_notifications, email_digest_enabled')
      .eq('id', userId)
      .single();

    if (!profile?.email) continue;
    if (profile.email_notifications === false) continue;
    if (profile.email_digest_enabled === false) continue;

    const result = await sendEmail({
      to: profile.email,
      subject: replies.length === 1
        ? `${replies[0].authorName} replied to your post`
        : `${replies.length} new replies to your posts`,
      react: React.createElement(DailyDigestEmail, {
        userName: profile.display_name || 'there',
        replies,
      }),
    });

    if (result.success) {
      await logEmail(userId, 'daily_digest', { replyCount: replies.length });
      sentToday.add(userId);
      console.log('[email] digest sent to', profile.email);
    }
  }
}

async function runForumFollowDigest(sentToday) {
  const supabase = getServiceClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper.community';

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Get all threads posted in the last 24h with their forum associations
  const { data: recentThreads } = await supabase
    .from('threads')
    .select('id, title, body, user_id, created_at, profiles:user_id(display_name), thread_forums(forum_id, forums:forum_id(name, slug, drug_slug))')
    .gte('created_at', twentyFourHoursAgo);

  if (!recentThreads || recentThreads.length === 0) return;

  // Collect all forum IDs that have new posts
  const forumIds = new Set();
  for (const thread of recentThreads) {
    for (const tf of (thread.thread_forums || [])) {
      forumIds.add(tf.forum_id);
    }
  }

  if (forumIds.size === 0) return;

  // Get all followers for those forums
  const { data: follows } = await supabase
    .from('forum_follows')
    .select('follower_id, forum_id')
    .in('forum_id', Array.from(forumIds));

  if (!follows || follows.length === 0) return;

  // Group by follower: which forums they follow that have new posts
  const byFollower = {};
  for (const f of follows) {
    if (!byFollower[f.follower_id]) byFollower[f.follower_id] = new Set();
    byFollower[f.follower_id].add(f.forum_id);
  }

  // Build posts list per follower
  for (const [userId, followedForumIds] of Object.entries(byFollower)) {
    if (sentToday.has(userId)) continue;
    if (await hasReceivedEmailToday(userId)) continue;
    if (await hasReceivedEmailType(userId, 'forum_follow_digest', 1)) continue;

    const posts = [];
    for (const thread of recentThreads) {
      if (thread.user_id === userId) continue; // don't notify about own posts
      const matchingForum = (thread.thread_forums || []).find((tf) => followedForumIds.has(tf.forum_id));
      if (!matchingForum) continue;

      const forum = matchingForum.forums;
      const forumSlug = forum?.drug_slug || forum?.slug || '';
      posts.push({
        forumName: forum?.name || 'a forum',
        threadTitle: thread.title,
        authorName: thread.profiles?.display_name || 'Someone',
        preview: (thread.body || '').slice(0, 150),
        threadUrl: `${siteUrl}/thread/${thread.id}`,
      });
    }

    if (posts.length === 0) continue;

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, display_name, email_notifications')
      .eq('id', userId)
      .single();

    if (!profile?.email || profile.email_notifications === false) continue;

    const result = await sendEmail({
      to: profile.email,
      subject: posts.length === 1
        ? `New post in ${posts[0].forumName}`
        : `${posts.length} new posts in forums you follow`,
      react: React.createElement(ForumNewPostEmail, {
        userName: profile.display_name || 'there',
        posts,
      }),
    });

    if (result.success) {
      await logEmail(userId, 'forum_follow_digest', { postCount: posts.length });
      sentToday.add(userId);
      console.log('[email] forum-follow-digest sent to', profile.email, `(${posts.length} posts)`);
    }
  }
}

async function runIntroduceYourself(sentToday) {
  const supabase = getServiceClient();

  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  // Find users created at least 48h ago who have email on
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, display_name, email_notifications, created_at')
    .lt('created_at', fortyEightHoursAgo)
    .eq('email_notifications', true)
    .not('email', 'is', null);

  if (!users || users.length === 0) return;

  for (const user of users) {
    if (sentToday.has(user.id)) continue;
    if (await hasReceivedEmailToday(user.id)) continue;

    // Max 2 sends total — check how many introduce_yourself emails already sent
    const { count: sendCount } = await supabase
      .from('email_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('email_type', 'introduce_yourself');

    if ((sendCount || 0) >= 2) continue;

    // Cooldown: 2 days between sends
    if (await hasReceivedEmailType(user.id, 'introduce_yourself', 2)) continue;

    // Check if they've posted anything — stop if they have
    const { count: threadCount } = await supabase
      .from('threads')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: replyCount } = await supabase
      .from('replies')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((threadCount || 0) > 0 || (replyCount || 0) > 0) continue;

    const result = await sendEmail({
      to: user.email,
      subject: 'Welcome to TaperCommunity — say hello when you\'re ready',
      react: React.createElement(IntroduceYourselfEmail, {
        userName: user.display_name || 'there',
      }),
    });

    if (result.success) {
      await logEmail(user.id, 'introduce_yourself');
      sentToday.add(user.id);
      console.log('[email] introduce-yourself sent to', user.email, `(send #${(sendCount || 0) + 1})`);
    }
  }
}

async function runWeMissYou(sentToday) {
  const supabase = getServiceClient();

  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

  // Find users with email_notifications enabled
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, display_name, email_notifications')
    .eq('email_notifications', true)
    .not('email', 'is', null);

  if (!users || users.length === 0) return;

  for (const user of users) {
    if (sentToday.has(user.id)) continue;
    if (await hasReceivedEmailToday(user.id)) continue;
    // Max once per 14 days
    if (await hasReceivedEmailType(user.id, 'we_miss_you', 14)) continue;

    // Check they were previously active
    const { count: totalThreads } = await supabase
      .from('threads')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: totalReplies } = await supabase
      .from('replies')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((totalThreads || 0) === 0 && (totalReplies || 0) === 0) continue;

    // Check no recent activity
    const { count: recentThreads } = await supabase
      .from('threads')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', tenDaysAgo);

    const { count: recentReplies } = await supabase
      .from('replies')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', tenDaysAgo);

    if ((recentThreads || 0) > 0 || (recentReplies || 0) > 0) continue;

    const result = await sendEmail({
      to: user.email,
      subject: 'The community is here when you need us',
      react: React.createElement(WeMissYouEmail, {
        userName: user.display_name || 'there',
      }),
    });

    if (result.success) {
      await logEmail(user.id, 'we_miss_you');
      sentToday.add(user.id);
      console.log('[email] we-miss-you sent to', user.email);
    }
  }
}

async function runTaperReminder(sentToday) {
  const supabase = getServiceClient();

  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();

  // Find users with journal entries (active tapers) who haven't logged recently
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, display_name, email_notifications, email_reminders_enabled')
    .eq('email_notifications', true)
    .eq('email_reminders_enabled', true)
    .not('email', 'is', null);

  if (!users || users.length === 0) return;

  for (const user of users) {
    if (sentToday.has(user.id)) continue;
    if (await hasReceivedEmailToday(user.id)) continue;
    // 4-day cooldown between sends
    if (await hasReceivedEmailType(user.id, 'taper_reminder', 4)) continue;

    // Max 2 sends per gap — resets when user logs a new entry
    const { data: latestEntry } = await supabase
      .from('journal_entries')
      .select('drug, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestEntry) continue; // no entries, not actively tapering

    // Check if latest entry is older than 4 days
    if (new Date(latestEntry.created_at) > new Date(fourDaysAgo)) continue;

    // Count reminders sent AFTER the user's latest entry (resets on new entry)
    const { count: remindersSinceEntry } = await supabase
      .from('email_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('email_type', 'taper_reminder')
      .gt('sent_at', latestEntry.created_at);

    if ((remindersSinceEntry || 0) >= 2) continue; // already sent at day 4 and day 8

    const daysSince = Math.floor((Date.now() - new Date(latestEntry.created_at).getTime()) / (24 * 60 * 60 * 1000));

    const result = await sendEmail({
      to: user.email,
      subject: 'How\'s your taper going? Time for a quick check-in',
      react: React.createElement(TaperReminderEmail, {
        userName: user.display_name || 'there',
        medicationName: latestEntry.drug || 'medication',
        daysSinceCheckin: daysSince,
      }),
    });

    if (result.success) {
      await logEmail(user.id, 'taper_reminder', { drug: latestEntry.drug, daysSince });
      sentToday.add(user.id);
      console.log('[email] taper-reminder sent to', user.email, `(day ${daysSince}, reminder #${(remindersSinceEntry || 0) + 1})`);
    }
  }
}
