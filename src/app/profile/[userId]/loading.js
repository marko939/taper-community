export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Profile header skeleton */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-border-subtle" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-40 animate-pulse rounded bg-border-subtle" />
            <div className="h-4 w-64 animate-pulse rounded bg-border-subtle" />
            <div className="flex gap-4">
              <div className="h-4 w-16 animate-pulse rounded bg-border-subtle" />
              <div className="h-4 w-16 animate-pulse rounded bg-border-subtle" />
              <div className="h-4 w-20 animate-pulse rounded bg-border-subtle" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-1 rounded-full border border-border-subtle bg-surface-glass p-1">
        {['posts', 'replies', 'journal'].map((t) => (
          <div key={t} className="flex-1 rounded-full px-4 py-2">
            <div className="mx-auto h-4 w-12 animate-pulse rounded bg-border-subtle" />
          </div>
        ))}
      </div>

      {/* Post cards skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card space-y-2">
            <div className="h-5 w-3/4 animate-pulse rounded bg-border-subtle" />
            <div className="flex gap-2">
              <div className="h-3 w-16 animate-pulse rounded bg-border-subtle" />
              <div className="h-3 w-12 animate-pulse rounded bg-border-subtle" />
            </div>
            <div className="h-4 w-full animate-pulse rounded bg-border-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}
