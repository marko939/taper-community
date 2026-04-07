import { createClient as createAuthClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/blog';

export const dynamic = 'force-dynamic';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

async function requireAdmin() {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || !isAdmin(user.id)) return null;
  return user;
}

// Create a new clinician CRM entry
export async function POST(req) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name } = body;
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase.from('clinician_crm').insert({
    name: name.trim(),
    credentials: body.credentials || null,
    clinic: body.clinic || null,
    state: body.state || null,
    address: body.address || null,
    phone: body.phone || null,
    email_website: body.email_website || null,
    description: body.description || null,
    source: body.source || null,
    category: body.category || null,
    practice_type: body.practice_type || null,
    status: body.status || 'new',
    admin_notes: body.admin_notes || null,
  }).select('id').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// Update any fields on an existing clinician CRM entry
export async function PUT(req) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, ...fields } = await req.json();
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const supabase = getServiceClient();
  const { data, error } = await supabase.from('clinician_crm')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// Delete a clinician CRM entry
export async function DELETE(req) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const supabase = getServiceClient();
  const { error } = await supabase.from('clinician_crm').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
