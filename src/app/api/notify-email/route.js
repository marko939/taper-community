import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { reply_id, thread_id } = await request.json();

  if (!reply_id || !thread_id) {
    return NextResponse.json({ error: 'reply_id and thread_id required' }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ skipped: true, reason: 'RESEND_API_KEY not configured' });
  }

  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ skipped: true, reason: 'SUPABASE_SERVICE_ROLE_KEY not configured' });
  }

  // Use service role client to bypass RLS — we need to read all recipients' notifications
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Fetch all un-emailed notifications for this reply
    const { data: notifications, error: fetchErr } = await supabase
      .from('notifications')
      .select('id, user_id, title, body, thread_id')
      .eq('reply_id', reply_id)
      .eq('emailed', false);

    if (fetchErr) {
      console.error('[notify-email] fetch error:', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const { Resend } = await import('resend');
    const resend = new Resend(resendKey);

    let sent = 0;
    const notificationIds = [];

    for (const notification of notifications) {
      // Fetch recipient profile
      const { data: recipient } = await supabase
        .from('profiles')
        .select('email, email_notifications')
        .eq('id', notification.user_id)
        .single();

      if (!recipient?.email || recipient.email_notifications === false) {
        notificationIds.push(notification.id);
        continue;
      }

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taper-community.vercel.app';
      const replyHash = reply_id ? `#reply-${reply_id}` : '';
      const threadUrl = `${siteUrl}/thread/${notification.thread_id}${replyHash}`;

      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'TaperCommunity <onboarding@resend.dev>',
          to: recipient.email,
          subject: notification.title,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px;">
              <p style="color: #333; font-size: 15px; line-height: 1.5;">${notification.title}</p>
              ${notification.body ? `<blockquote style="border-left: 3px solid #8b5cf6; margin: 12px 0; padding: 8px 12px; color: #666; font-size: 14px;">${notification.body}</blockquote>` : ''}
              <p><a href="${threadUrl}" style="display: inline-block; padding: 8px 16px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-size: 14px;">View Thread</a></p>
              <p style="color: #999; font-size: 12px; margin-top: 24px;">You can turn off email notifications in your <a href="${siteUrl}/settings" style="color: #8b5cf6;">settings</a>.</p>
            </div>
          `,
        });
        sent++;
      } catch (emailErr) {
        console.error('[notify-email] send error:', emailErr);
      }

      notificationIds.push(notification.id);
    }

    // Mark all processed notifications as emailed
    if (notificationIds.length > 0) {
      await supabase
        .from('notifications')
        .update({ emailed: true })
        .in('id', notificationIds);
    }

    return NextResponse.json({ sent });
  } catch (err) {
    console.error('[notify-email] error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
