'use client';
import ErrorFallback from '@/components/shared/ErrorFallback';
export default function AdminAnalyticsError({ error, reset }) {
  return <ErrorFallback error={error} reset={reset} routeLabel="admin-analytics" />;
}
