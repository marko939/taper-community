'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function JoinRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      router.replace(`/auth/signup?ref=${encodeURIComponent(ref)}`);
    } else {
      router.replace('/auth/signup');
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-text-muted">Redirecting...</p>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center"><p className="text-text-muted">Redirecting...</p></div>}>
      <JoinRedirect />
    </Suspense>
  );
}
