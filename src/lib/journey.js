import { createClient } from '@/lib/supabase/server';

export async function getJourneyData(username) {
  const supabase = await createClient();

  // Fetch profile by username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, drug, taper_stage, bio, drug_signature, username')
    .eq('username', username)
    .single();

  if (profileError || !profile) return null;

  // Fetch public journal entries
  const { data: entries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .order('date', { ascending: false });

  // Fetch assessments for this user (public data)
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', profile.id)
    .order('date', { ascending: false });

  return {
    profile,
    entries: entries || [],
    assessments: assessments || [],
  };
}
