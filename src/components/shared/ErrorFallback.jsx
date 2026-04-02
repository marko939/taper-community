'use client';

import { useRouter } from 'next/navigation';

export default function ErrorFallback({ error, reset, routeLabel }) {
  const router = useRouter();

  if (routeLabel) {
    console.error(`[${routeLabel}] error boundary:`, error);
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md rounded-2xl border p-8" style={{ borderColor: 'var(--border-subtle)' }}>
        <p className="text-lg font-medium text-foreground">Something went wrong</p>
        <p className="mt-2 text-sm text-text-muted">
          Try refreshing or going back. If this keeps happening, let us know.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-purple px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Try again
          </button>
          <button
            onClick={() => router.push('/')}
            className="rounded-xl border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-hover"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
