import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    console.error('[auth/callback] No code parameter in callback URL');
    return NextResponse.redirect(
      `${origin}/auth/signin?error=${encodeURIComponent('No authorization code received. Please try again.')}`
    );
  }

  console.log('[auth/callback] Exchanging code for session...');
  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] Code exchange failed:', error.message);
    return NextResponse.redirect(
      `${origin}/auth/signin?error=${encodeURIComponent(error.message)}`
    );
  }

  const user = data.session?.user;
  if (!user) {
    console.error('[auth/callback] No user in session after code exchange');
    return NextResponse.redirect(
      `${origin}/auth/signin?error=${encodeURIComponent('Session could not be created. Please try again.')}`
    );
  }

  console.log('[auth/callback] Session created for user:', user.id);

  // Check if this is a new or returning user.
  // The database trigger on auth.users INSERT auto-creates the profile row,
  // so we do NOT insert manually (RLS would block it anyway).
  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('[auth/callback] Profile check failed:', profileError.message);
  }

  if (!existingProfile) {
    // New user — trigger may not have fired yet, send to onboarding
    console.log('[auth/callback] New user, redirecting to /onboarding');
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  // Existing user → send home
  console.log('[auth/callback] Existing user, redirecting to /');
  return NextResponse.redirect(`${origin}/`);
}
