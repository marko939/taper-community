/**
 * Shared loading skeleton component for loading.js files.
 * Variants match the layout of each page type.
 *
 * Usage: <PageSkeleton variant="feed" />
 */

function Pulse({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-border-subtle/40 ${className}`} />;
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center gap-3">
        <Pulse className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Pulse className="h-4 w-32" />
          <Pulse className="mt-1.5 h-3 w-20" />
        </div>
      </div>
      <Pulse className="mt-3 h-4 w-3/4" />
      <Pulse className="mt-2 h-3 w-full" />
      <Pulse className="mt-1.5 h-3 w-5/6" />
      <div className="mt-3 flex gap-4">
        <Pulse className="h-3 w-12" />
        <Pulse className="h-3 w-16" />
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <Pulse className="h-8 w-48" />
      <div className="flex gap-3">
        <Pulse className="h-9 w-20 rounded-full" />
        <Pulse className="h-9 w-24 rounded-full" />
        <Pulse className="h-9 w-20 rounded-full" />
      </div>
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

function ThreadSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Pulse className="h-3 w-32" />
      <Pulse className="mt-4 h-7 w-3/4" />
      <div className="mt-4 flex items-center gap-3">
        <Pulse className="h-10 w-10 rounded-full" />
        <div>
          <Pulse className="h-4 w-28" />
          <Pulse className="mt-1 h-3 w-20" />
        </div>
      </div>
      <Pulse className="mt-6 h-4 w-full" />
      <Pulse className="mt-2 h-4 w-full" />
      <Pulse className="mt-2 h-4 w-5/6" />
      <Pulse className="mt-2 h-4 w-3/4" />
      <div className="mt-8 border-t pt-6" style={{ borderColor: 'var(--border-subtle)' }}>
        <Pulse className="h-5 w-24" />
        <div className="mt-4 space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-start gap-4">
        <Pulse className="h-20 w-20 rounded-full" />
        <div className="flex-1">
          <Pulse className="h-7 w-40" />
          <Pulse className="mt-2 h-4 w-64" />
          <div className="mt-3 flex gap-4">
            <Pulse className="h-4 w-20" />
            <Pulse className="h-4 w-24" />
          </div>
        </div>
      </div>
      <div className="mt-8 space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-3 px-4 py-6">
      <Pulse className="h-8 w-48" />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <Pulse className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Pulse className="h-4 w-40" />
            <Pulse className="mt-1.5 h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <Pulse className="h-8 w-48" />
      <Pulse className="h-12 w-full rounded-xl" />
      <Pulse className="h-12 w-full rounded-xl" />
      <Pulse className="h-32 w-full rounded-xl" />
      <Pulse className="h-12 w-32 rounded-xl" />
    </div>
  );
}

const variants = {
  feed: FeedSkeleton,
  thread: ThreadSkeleton,
  profile: ProfileSkeleton,
  list: ListSkeleton,
  form: FormSkeleton,
};

export default function PageSkeleton({ variant = 'feed' }) {
  const Component = variants[variant] || FeedSkeleton;
  return <Component />;
}
