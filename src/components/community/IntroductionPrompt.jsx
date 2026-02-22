'use client';

import Link from 'next/link';

export default function IntroductionPrompt() {
  return (
    <div className="glass-panel panel-border-accent p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Start Your Taper Journal</h3>
          <p className="mt-1 text-sm text-text-muted">
            Track your taper journey in your journal. Mark entries as public to share on your
            profile, and post them to community forums to connect with others.
          </p>
        </div>
        <Link href="/journal" className="btn btn-primary shrink-0 text-sm no-underline">
          Open Journal
        </Link>
      </div>
    </div>
  );
}
