'use client';
import ErrorFallback from '@/components/shared/ErrorFallback';
export default function AdminMatchRequestsError({ error, reset }) {
  return <ErrorFallback error={error} reset={reset} routeLabel="admin-match-requests" />;
}
