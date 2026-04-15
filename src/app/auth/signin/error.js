'use client';
import ErrorFallback from '@/components/shared/ErrorFallback';
export default function SignInError({ error, reset }) {
  return <ErrorFallback error={error} reset={reset} routeLabel="auth-signin" />;
}
