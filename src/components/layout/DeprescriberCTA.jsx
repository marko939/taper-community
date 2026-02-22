'use client';

import Link from 'next/link';

export default function DeprescriberCTA({ className = '' }) {
  return (
    <div className={`glass-panel panel-border-accent p-4 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Need a clinician who understands tapering?
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            Browse our map of deprescribing-informed providers worldwide.
          </p>
        </div>
        <Link
          href="/deprescribers"
          className="btn btn-primary shrink-0 text-center text-sm no-underline"
        >
          Find a Deprescriber
        </Link>
      </div>
    </div>
  );
}
