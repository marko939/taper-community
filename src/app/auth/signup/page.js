'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Suspense } from 'react';

function SignUpForm() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if already signed in
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) router.replace('/');
    });
  }, []);

  // Persist referral code to localStorage
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('taper_ref', ref);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = displayName.trim();

    // Client-side validation
    if (!trimmedName) {
      setError('Please enter a display name.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: { data: { display_name: trimmedName } },
      });

      if (signUpError) {
        const raw = signUpError.message || '';
        if (raw.includes('already registered') || raw.includes('already been registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (raw.includes('valid email')) {
          setError('Please enter a valid email address.');
        } else if (raw.includes('rate') || raw.includes('too many')) {
          setError('Too many signup attempts. Please wait a moment and try again.');
        } else {
          setError(raw || 'Signup failed. Please try again.');
        }
        return;
      }

      // Email confirmation is OFF — session should exist immediately
      if (data?.session) {
        setLoading(false);
        window.location.href = '/onboarding';
        return;
      }

      // Fallback: no session returned (shouldn't happen with autoconfirm)
      setError('Account created! Please sign in.');
    } catch (err) {
      console.error('[signup] error:', err?.message);
      setError(err?.message || 'Signup failed. Please try again.');
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
          <h1 className="mb-6 text-center font-serif text-[28px] font-semibold text-foreground">Join TaperCommunity</h1>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How you'll appear to others"
                className="input"
                required
              />
            </div>
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
                placeholder="Minimum 8 characters"
                className="input"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-medium" style={{ color: 'var(--purple)' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
