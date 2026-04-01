export default function ForumLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="glass-panel overflow-hidden">
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--purple), var(--purple-light))' }} />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="h-3 w-32 animate-pulse rounded bg-border-subtle" />
              <div className="h-8 w-48 animate-pulse rounded bg-border-subtle" />
              <div className="h-4 w-72 animate-pulse rounded bg-border-subtle" />
            </div>
            <div className="flex shrink-0 gap-2">
              <div className="h-10 w-24 animate-pulse rounded-lg bg-border-subtle" />
              <div className="h-10 w-28 animate-pulse rounded-lg bg-border-subtle" />
            </div>
          </div>
        </div>
      </div>

      {/* Search bar skeleton */}
      <div className="h-11 w-full animate-pulse rounded-xl bg-border-subtle" />

      {/* Thread cards skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card space-y-2">
            <div className="h-5 animate-pulse rounded bg-border-subtle" style={{ width: `${60 + (i * 7) % 30}%` }} />
            <div className="flex gap-2">
              <div className="h-3 w-20 animate-pulse rounded bg-border-subtle" />
              <div className="h-3 w-14 animate-pulse rounded bg-border-subtle" />
              <div className="h-3 w-16 animate-pulse rounded bg-border-subtle" />
            </div>
            <div className="h-4 w-full animate-pulse rounded bg-border-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}
