import { NextResponse } from 'next/server';

export async function POST(request) {
  const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const SUPABASE_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/\s+/g, '');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[api/auth/signup] Missing env vars');
    return NextResponse.json(
      { error: 'Server configuration error. Please try again later.' },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { email, password, displayName } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  try {
    const endpoint = `${SUPABASE_URL}/auth/v1/signup`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        data: { display_name: displayName || '' },
      }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      console.error('[api/auth/signup] Failed to parse Supabase response, status:', res.status);
      return NextResponse.json(
        { error: 'Signup service returned an unexpected response. Please try again.' },
        { status: 502 }
      );
    }

    if (!res.ok) {
      const raw = data?.msg || data?.message || data?.error_description || '';
      let msg;
      if (raw.includes('already registered') || raw.includes('already been registered')) {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (raw.includes('valid email')) {
        msg = 'Please enter a valid email address.';
      } else if (raw.includes('password') && raw.includes('short')) {
        msg = 'Password must be at least 8 characters.';
      } else if (res.status === 429 || raw.includes('rate') || raw.includes('too many')) {
        msg = 'Too many signup attempts. Please wait a moment and try again.';
      } else {
        msg = raw || 'Signup failed. Please try again.';
      }
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    // Supabase returns 200 but no session if user already exists (soft-deleted or unconfirmed)
    if (!data.access_token) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      user: data.user || data,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
  } catch (err) {
    console.error('[api/auth/signup] Exception:', err.message);
    return NextResponse.json(
      { error: 'Could not connect to the signup service. Please try again.' },
      { status: 503 }
    );
  }
}
