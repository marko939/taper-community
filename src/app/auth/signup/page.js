'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Suspense } from 'react';
import { safeLocal } from '@/lib/safeStorage';

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
      safeLocal.set('taper_ref', ref);
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

      // Signup succeeded — redirect to onboarding
      // Session should exist immediately since email confirmation is OFF
      setLoading(false);
      window.location.href = '/onboarding';
      return;
    } catch (err) {
      console.error('[signup] error:', err?.message);
      setError(err?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { text: 'Daily symptom tracking built on the Maudsley Guidelines', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
    { text: 'Drug-specific forums with peer support', icon: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155' },
    { text: '57+ deprescribing clinicians directory', icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z' },
    { text: 'Always free \u2014 no paywalls on the help you need', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
  ];

  const trustBadges = ['Free forever', 'No credit card', 'Your data stays private'];

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
        <div className="flex w-full max-w-3xl flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-12">

          {/* Benefits column */}
          <div className="hidden w-full max-w-xs shrink-0 space-y-6 lg:block">
            <h2 className="font-serif text-2xl font-semibold text-white">
              Everything you need to taper safely
            </h2>
            <ul className="space-y-4">
              {benefits.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0" style={{ color: '#2EC4B6' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className="text-sm leading-relaxed text-white/80">{item.text}</span>
                </li>
              ))}
            </ul>

            {/* Testimonial */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
              <p className="text-xs leading-relaxed text-white/70">
                {'"'}After years on Surviving Antidepressants and BenzoBuddies, TaperCommunity is the first place that actually felt like home. The taper journal changed everything about how I approach my taper.{'"'}
              </p>
              <p className="mt-2 text-xs font-semibold text-white/50">{'— Catina, Community Support Member'}</p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {trustBadges.map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-white/60" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <svg className="h-3.5 w-3.5" style={{ color: '#2EC4B6' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Form card */}
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
