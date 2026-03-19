import { sendEmail } from '@/lib/email/resend';
import { MatchConfirmationEmail } from '@/lib/email/templates/match-confirmation';
import { MatchAdminNotificationEmail } from '@/lib/email/templates/match-admin-notification';

export async function POST(request) {
  try {
    const body = await request.json();
    const { patientName, patientEmail, clinicianName, matchRequestId } = body;

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
        matchRequestId,
      }),
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('[match-request] Email failed:', err);
    return Response.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
