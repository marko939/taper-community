import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './resend';
import { hasReceivedEmailToday, hasReceivedEmailType, logEmail } from './throttle';
import { DailyDigestEmail } from './templates/daily-digest';
import { TaperReminderEmail } from './templates/taper-reminder';
import { IntroduceYourselfEmail } from './templates/introduce-yourself';
import { WeMissYouEmail } from './templates/we-miss-you';
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

  // Priority order: digest > introduce yourself > we miss you > taper reminder
  await runDigest(sentToday);
  await runIntroduceYourself(sentToday);
  await runWeMissYou(sentToday);
  await runTaperReminder(sentToday);

  console.log('[email] run complete. Emails sent to', sentToday.size, 'users');
}

// ── JOB 1: Daily reply digest ──────────────────────────────────────

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

// ── JOB 2: Introduce yourself (48h no post, repeat once after 2 more days) ──

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

// ── JOB 3: We miss you (10 day inactive) ───────────────────────────

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

// ── JOB 4: Taper tracker reminder (4 day no check-in) ──────────────

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
