'use client';
import ErrorFallback from '@/components/shared/ErrorFallback';
export default function RootError({ error, reset }) {
  return <ErrorFallback error={error} reset={reset} routeLabel="root" />;
}
