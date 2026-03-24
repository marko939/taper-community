import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/resend';
import { MatchConfirmationEmail } from '@/lib/email/templates/match-confirmation';
import { MatchAdminNotificationEmail } from '@/lib/email/templates/match-admin-notification';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { patientName, patientEmail, clinicianName, matchRequestId } = body;

    // If this is an onboarding request (has insert flag), create the DB record server-side
    // This bypasses the client-side Supabase auth lock that blocks fresh signups
    let insertedId = matchRequestId;
    if (body.insert && body.userId) {
      const supabase = getServiceClient();
      const { data, error } = await supabase.from('match_requests').insert({
        clinician_id: body.clinicianId || null,
        user_id: body.userId,
        patient_name: patientName,
        patient_email: patientEmail,
        medications: body.medications || null,
        support_types: body.supportTypes || ['general'],
        notes: body.notes || null,
        status: 'pending',
      }).select('id').single();
      if (error) {
        console.error('[match-request] DB insert failed:', error);
        return Response.json({ error: error.message }, { status: 500 });
      }
      insertedId = data.id;
    }

    if (!patientEmail || !patientName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send confirmation to patient
    await sendEmail({
      to: patientEmail,
      subject: `Your request to connect with ${clinicianName || 'a provider'} — TaperCommunity`,
      react: MatchConfirmationEmail({ patientName, clinicianName }),
    });

    // Send admin notification
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'marko@taper.community';
    await sendEmail({
      to: adminEmail,
      subject: `New match request: ${patientName} → ${clinicianName || 'provider'}`,
      react: MatchAdminNotificationEmail({
        patientName,
        patientEmail,
        clinicianName,
        matchRequestId: insertedId,
      }),
    });

    return Response.json({ success: true, matchRequestId: insertedId });
  } catch (err) {
    console.error('[match-request] Error:', err);
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
