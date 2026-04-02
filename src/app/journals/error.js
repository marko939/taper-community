'use client';
import ErrorFallback from '@/components/shared/ErrorFallback';
export default function JournalsError({ error, reset }) {
  return <ErrorFallback error={error} reset={reset} routeLabel="journals" />;
}
