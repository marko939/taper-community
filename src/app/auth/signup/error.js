'use client';
import ErrorFallback from '@/components/shared/ErrorFallback';
export default function SignUpError({ error, reset }) {
  return <ErrorFallback error={error} reset={reset} routeLabel="auth-signup" />;
}
