'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Show error from OAuth callback redirect
  useEffect(() => {
    const callbackError = searchParams.get('error');
    if (callbackError) {
      setError(callbackError === 'auth' ? 'Authentication failed. Please try again.' : callbackError);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('[signin] Attempting sign in for:', email);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      console.error('[signin] signInWithPassword failed:', signInError.message);
      setError(signInError.message);
      setLoading(false);
      return;
    }

    console.log('[signin] Signed in, user:', data.user?.id);
    router.refresh();
    router.push('/');
  };

  return (
    <div className="mx-auto max-w-3xl py-12">
      <div
        className="relative overflow-hidden rounded-[24px] px-12 py-28"
        style={{ boxShadow: '0 12px 48px rgba(91, 46, 145, 0.25), 0 4px 16px rgba(0,0,0,0.1)' }}
      >
        <div className="absolute inset-0">
          <img src="/hero-bg.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="pointer-events-none absolute inset-0" style={{ background: 'rgba(42,18,80,0.35)' }} />
        <div className="relative z-10 mx-auto max-w-md">
          <div className="glass-panel p-8" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)' }}>
            <h1 className="mb-6 text-center text-3xl font-semibold text-foreground">Welcome Back</h1>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-medium text-accent-blue hover:underline">Join TaperCommunity</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
