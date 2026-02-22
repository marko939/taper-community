import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request) {
  try {
    const { email, password, displayName } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Call Supabase Auth from the server — no browser cookies, no CORS,
    // no corrupted Authorization headers.
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },
      body: JSON.stringify({
        email,
        password,
        data: { display_name: displayName || '' },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data.msg || data.message || data.error_description || 'Signup failed';
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    // Return the tokens so the client can set the session
    return NextResponse.json({
      user: data.user || data,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
  } catch (err) {
    console.error('[api/auth/signup] Error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
