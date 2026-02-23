import { createClient } from '@/lib/supabase/client';

export async function createInviteLink(userId) {
  const supabase = createClient();

  // Check for existing unused invite
  const { data: existing } = await supabase
    .from('peer_invites')
    .select('invite_code')
    .eq('referrer_id', userId)
    .is('referred_id', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    return existing.invite_code;
  }

  // Create new invite
  const { data, error } = await supabase
    .from('peer_invites')
    .insert({ referrer_id: userId })
    .select('invite_code')
    .single();

  if (error) {
    console.error('[invites] Create failed:', error.message);
    return null;
  }
  return data.invite_code;
}

export async function recordReferral(code, newUserId) {
  if (!code || !newUserId) return;
  const supabase = createClient();

  const { error } = await supabase
    .from('peer_invites')
    .update({ referred_id: newUserId, converted_at: new Date().toISOString() })
    .eq('invite_code', code)
    .is('referred_id', null);

  if (error) {
    console.error('[invites] Record referral failed:', error.message);
  }
}
