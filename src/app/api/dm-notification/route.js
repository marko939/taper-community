import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/resend';
import { DMNotificationEmail } from '@/lib/email/templates/dm-notification';

// Use service role to read recipient's profile + email prefs (bypasses RLS)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request) {
  try {
    const { recipientId, senderId, messageBody } = await request.json();

    if (!recipientId || !senderId || !messageBody) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const [recipientResult, senderResult] = await Promise.all([
      supabase.from('profiles').select('id, display_name, email_notifications').eq('id', recipientId).single(),
      supabase.from('profiles').select('id, display_name').eq('id', senderId).single(),
    ]);

    const recipient = recipientResult.data;
    const sender = senderResult.data;

    if (!recipient || !sender) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Respect email preferences
    if (recipient.email_notifications === false) {
      return Response.json({ skipped: true, reason: 'notifications disabled' });
    }

    // Get recipient's email from auth.users (not in profiles table)
    const { data: authUser } = await supabase.auth.admin.getUserById(recipientId);
    const recipientEmail = authUser?.user?.email;

    if (!recipientEmail) {
      return Response.json({ error: 'No email found' }, { status: 404 });
    }

    // Throttle: don't send if we already emailed this recipient about a DM in the last 5 minutes
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentEmails } = await supabase
      .from('email_log')
      .select('id')
      .eq('user_id', recipientId)
      .eq('email_type', 'dm_notification')
      .gte('sent_at', fiveMinAgo)
      .limit(1);

    if (recentEmails && recentEmails.length > 0) {
      return Response.json({ skipped: true, reason: 'throttled' });
    }

    const preview = messageBody.length > 200 ? messageBody.substring(0, 200) + '...' : messageBody;
    const senderName = sender.display_name || 'Someone';
    const recipientName = recipient.display_name || 'there';

    await sendEmail({
      to: recipientEmail,
      subject: `${senderName} sent you a message — TaperCommunity`,
      react: DMNotificationEmail({ recipientName, senderName, messagePreview: preview }),
    });

    // Log to prevent duplicate sends
    await supabase.from('email_log').insert({
      user_id: recipientId,
      email_type: 'dm_notification',
      metadata: { sender_id: senderId },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('[dm-notification] Email failed:', err);
    return Response.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
