import { createClient as createAuthClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { resolveRegion } from '@/lib/regions';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Get authenticated user
    const authClient = await createAuthClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    // Read Vercel geo headers. These are injected automatically by Vercel's edge
    // network in production — no config needed there. They're absent in local
    // dev, so we fall back to DEV_GEO (e.g. "San Francisco,CA,US") when that
    // env var is set AND we're not in production. Safe: prod branch never
    // looks at DEV_GEO.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || null;
    // Vercel's canonical state/region header is `x-vercel-ip-country-region`;
    // the older `x-vercel-ip-region` is deprecated and not always populated.
    // Try both for robustness.
    let city = request.headers.get('x-vercel-ip-city') || '';
    let region = request.headers.get('x-vercel-ip-country-region')
      || request.headers.get('x-vercel-ip-region')
      || '';
    let country = request.headers.get('x-vercel-ip-country') || '';
    // URL-decode city — Vercel sends e.g. "Los%20Angeles".
    if (city) {
      try { city = decodeURIComponent(city); } catch { /* keep raw */ }
    }

    if (!country && process.env.NODE_ENV !== 'production' && process.env.DEV_GEO) {
      const devParts = process.env.DEV_GEO.split(',').map((s) => s.trim());
      city = devParts[0] || '';
      region = devParts[1] || '';
      country = devParts[2] || '';
    }

    const parts = [city, region, country].filter(Boolean);
    const ipLocation = parts.length > 0 ? parts.join(', ') : null;

    // Update profile with service role client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

    // Read the user's manual `location` field so the resolver can blend it in
    // when IP headers are sparse (localhost, VPN traffic, etc.).
    const { data: profile } = await supabase
      .from('profiles')
      .select('location')
      .eq('id', user.id)
      .maybeSingle();

    const resolved = resolveRegion({ ipLocation, location: profile?.location });

    // Build patch. Always write ip_location (nullable) so stale values get
    // cleared when a user moves. Region fields only get written when we could
    // actually resolve a region — otherwise leave any prior value in place so
    // we don't lose previously-known region data on a partial geo lookup.
    const patch = { last_ip: ip, ip_location: ipLocation };
    if (resolved) {
      patch.region_code = resolved.code;
      patch.region_label = resolved.label;
      patch.region_source = 'ip';
    }

    await supabase
      .from('profiles')
      .update(patch)
      .eq('id', user.id);

    return NextResponse.json({ ok: true, region: resolved });
  } catch (err) {
    console.error('[api/auth/geo] failed:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
