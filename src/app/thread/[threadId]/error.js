'use client';
import ErrorFallback from '@/components/shared/ErrorFallback';
export default function ThreadError({ error, reset }) {
  return <ErrorFallback error={error} reset={reset} routeLabel="thread" />;
}
