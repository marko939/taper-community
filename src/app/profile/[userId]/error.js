'use client';
import ErrorFallback from '@/components/shared/ErrorFallback';
export default function ProfileError({ error, reset }) {
  return <ErrorFallback error={error} reset={reset} routeLabel="profile" />;
}
