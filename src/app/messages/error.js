'use client';
import ErrorFallback from '@/components/shared/ErrorFallback';
export default function MessagesError({ error, reset }) {
  return <ErrorFallback error={error} reset={reset} routeLabel="messages" />;
}
