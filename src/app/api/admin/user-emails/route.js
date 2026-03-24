import { createClient as createAuthClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/blog';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  // Auth check
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || !isAdmin(user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userIds } = await req.json();
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({});
  }

  // Use service role to query auth.users
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const emailMap = {};
  // Supabase admin listUsers doesn't filter by IDs, so query auth.users directly
  for (const id of userIds.slice(0, 100)) {
    try {
      const { data } = await supabase.auth.admin.getUserById(id);
      if (data?.user?.email) {
        emailMap[id] = data.user.email;
      }
    } catch { /* skip */ }
  }

  return NextResponse.json(emailMap);
}
