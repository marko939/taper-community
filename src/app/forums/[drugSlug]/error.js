'use client';
import ErrorFallback from '@/components/shared/ErrorFallback';
export default function ForumError({ error, reset }) {
  return <ErrorFallback error={error} reset={reset} routeLabel="forum-category" />;
}
