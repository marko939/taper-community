'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  const router = useRouter();
  useEffect(() => { console.error('[page] error boundary:', error); }, [error]);
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8 text-center">
      <p className="text-text-secondary">Something went wrong. Try refreshing or going back.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-secondary">Try again</button>
        <button onClick={() => router.push('/')} className="btn-primary">Go home</button>
      </div>
    </div>
  );
}
