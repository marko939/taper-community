import { NextResponse } from 'next/server';

export async function POST(request) {
  const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const SUPABASE_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/\s+/g, '');

  console.log('[api/auth/signup] SUPABASE_URL:', SUPABASE_URL ? SUPABASE_URL.substring(0, 30) + '...' : 'UNDEFINED');
  console.log('[api/auth/signup] SUPABASE_KEY:', SUPABASE_KEY ? `set (${SUPABASE_KEY.length} chars)` : 'UNDEFINED');

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json(
      { error: `Server config error: URL=${!!SUPABASE_URL}, KEY=${!!SUPABASE_KEY}` },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { email, password, displayName } = body;
    console.log('[api/auth/signup] email:', email, 'displayName:', displayName);

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const endpoint = `${SUPABASE_URL}/auth/v1/signup`;
    console.log('[api/auth/signup] Calling:', endpoint);

    const res = await fetch(endpoint, {
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
    console.log('[api/auth/signup] Supabase response status:', res.status);

    if (!res.ok) {
      const msg = data.msg || data.message || data.error_description || 'Signup failed';
      console.error('[api/auth/signup] Supabase error:', msg);
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    console.log('[api/auth/signup] Success, user:', data.user?.id || data.id);

    return NextResponse.json({
      user: data.user || data,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
  } catch (err) {
    console.error('[api/auth/signup] Exception:', err.message, err.stack);
    return NextResponse.json({ error: `Server error: ${err.message}` }, { status: 500 });
  }
}
