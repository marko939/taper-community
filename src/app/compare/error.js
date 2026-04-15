'use client';
import ErrorFallback from '@/components/shared/ErrorFallback';
export default function CompareError({ error, reset }) {
  return <ErrorFallback error={error} reset={reset} routeLabel="compare" />;
}
