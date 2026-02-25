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

  // Redirect if already signed in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) router.replace('/');
    });
  }, []);

  // Show error/success from callback or signup redirect
  useEffect(() => {
    const callbackError = searchParams.get('error');
    if (callbackError) {
      setError(callbackError === 'auth' ? 'Authentication failed. Please try again.' : callbackError);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (!result || result.error) {
        const raw = result?.error?.message || '';
        let msg;
        if (raw.includes('Invalid login credentials')) {
          msg = 'Incorrect email or password.';
        } else if (raw.includes('Email not confirmed')) {
          msg = 'Please confirm your email before signing in. Check your inbox.';
        } else if (raw.includes('rate') || raw.includes('too many')) {
          msg = 'Too many attempts. Please wait a moment and try again.';
        } else {
          msg = raw || 'Sign in failed. Please try again.';
        }
        setError(msg);
        return;
      }

      // Hard redirect to ensure fresh server-side cookie read
      window.location.href = '/';
    } catch (err) {
      console.error('[signin] error:', err?.message);
      setError(err?.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="relative overflow-hidden rounded-[24px]"
      style={{ boxShadow: '0 12px 48px rgba(91, 46, 145, 0.25), 0 4px 16px rgba(0,0,0,0.1)' }}
    >
      <div className="absolute inset-0">
        <img src="/hero-bg.jpg" alt="" className="h-full w-full object-cover" />
      </div>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'rgba(42,18,80,0.35)' }} />
      <div className="relative z-10 flex items-center justify-center px-6 py-16 sm:px-12 sm:py-20 lg:py-24">
        <div className="w-full max-w-sm rounded-2xl p-8 shadow-xl" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)' }}>
          <h1 className="mb-6 text-center font-serif text-[28px] font-semibold text-foreground">Welcome Back</h1>

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
            <Link href="/auth/signup" className="font-medium" style={{ color: 'var(--purple)' }}>Join TaperCommunity</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
