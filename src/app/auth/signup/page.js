'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignUpPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    console.log('[signup] Creating account for:', email);

    try {
      // Call our own API route — the server handles the Supabase call.
      // This avoids ALL browser-side header/cookie corruption issues.
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });

      const result = await res.json();
      console.log('[signup] Response status:', res.status);

      if (!res.ok) {
        console.error('[signup] Error:', result.error);
        setError(result.error || 'Signup failed');
        setLoading(false);
        return;
      }

      console.log('[signup] Account created');

      // Set the session in the browser client so cookies are written
      // and the middleware/sidebar pick up the logged-in state.
      if (result.access_token && result.refresh_token) {
        const supabase = createClient();
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });
        if (sessionError) {
          console.error('[signup] setSession failed:', sessionError.message);
        } else {
          console.log('[signup] Session set in browser client');
        }
      }

      // Redirect to onboarding
      console.log('[signup] Redirecting to /onboarding');
      router.refresh();
      router.push('/onboarding');

    } catch (err) {
      console.error('[signup] Fetch error:', err.message);
      setError(`Connection error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="glass-panel p-8">
        <h1 className="mb-6 text-center text-3xl font-semibold text-foreground">Join TaperCommunity</h1>

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
          <Link href="/auth/signin" className="font-medium text-accent-blue hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
