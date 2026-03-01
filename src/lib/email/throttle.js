import { createClient } from '@supabase/supabase-js';

let _supabase = null;

function getServiceClient() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
  }
  return _supabase;
}

// Check if user has already received ANY email today
export async function hasReceivedEmailToday(userId) {
  const supabase = getServiceClient();
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('email_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('sent_at', todayStart.toISOString());

  return (count || 0) > 0;
}

// Check if user has received a SPECIFIC email type within N days
export async function hasReceivedEmailType(userId, emailType, withinDays) {
  const supabase = getServiceClient();
  const since = new Date(Date.now() - withinDays * 24 * 60 * 60 * 1000);

  const { count } = await supabase
    .from('email_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('email_type', emailType)
    .gte('sent_at', since.toISOString());

  return (count || 0) > 0;
}

// Log that an email was sent
export async function logEmail(userId, emailType, metadata) {
  const supabase = getServiceClient();
  await supabase.from('email_log').insert({
    user_id: userId,
    email_type: emailType,
    sent_at: new Date().toISOString(),
    metadata: metadata || {},
  });
}
