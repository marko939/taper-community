export default function ThreadLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-12 animate-pulse rounded bg-border-subtle" />
        <span className="text-text-subtle">/</span>
        <div className="h-3 w-24 animate-pulse rounded bg-border-subtle" />
      </div>

      {/* Thread card skeleton */}
      <div className="card space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-border-subtle" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-3/4 animate-pulse rounded bg-border-subtle" />
            <div className="h-3 w-32 animate-pulse rounded bg-border-subtle" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-border-subtle" />
          <div className="h-4 w-full animate-pulse rounded bg-border-subtle" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-border-subtle" />
        </div>
      </div>

      {/* Replies heading skeleton */}
      <div className="h-6 w-24 animate-pulse rounded bg-border-subtle" />

      {/* Reply card skeletons */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 animate-pulse rounded-full bg-border-subtle" />
              <div className="h-3 w-24 animate-pulse rounded bg-border-subtle" />
            </div>
            <div className="h-4 w-full animate-pulse rounded bg-border-subtle" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-border-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}
