import { Resend } from 'resend';

let _resend = null;

function getResend() {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY not configured');
    _resend = new Resend(key);
  }
  return _resend;
}

export async function sendEmail({ to, subject, react }) {
  try {
    const resend = getResend();
    const from = process.env.RESEND_FROM_EMAIL || 'TaperCommunity <onboarding@resend.dev>';
    const { data, error } = await resend.emails.send({ from, to, subject, react });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[email] send failed:', err);
    return { success: false, error: err };
  }
}
