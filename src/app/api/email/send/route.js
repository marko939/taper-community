import { runEmailJobs } from '@/lib/email/runner';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.EMAIL_CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await runEmailJobs();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[email cron] error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
