import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/\s+/g, ''),
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh the auth token
    await supabase.auth.getUser();
  } catch (e) {
    // Don't block the request if auth refresh fails
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
