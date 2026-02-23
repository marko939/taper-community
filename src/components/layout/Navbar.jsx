'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/shared/Avatar';

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { href: '/forums', label: 'Forums' },
    { href: '/journal', label: 'Journal' },
    { href: 'https://tapermeds.com/education', label: 'Education', external: true },
    { href: '/deprescribers', label: 'Find a Provider' },
    { href: '/drugs', label: 'Drug Profiles' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-xl" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Image src="/tapercommunity-logo.png" alt="TaperCommunity" width={32} height={32} />
          <span className="text-xl font-semibold" style={{ fontFamily: 'Fraunces, Georgia, serif', color: 'var(--foreground)', letterSpacing: '-0.02em' }}>TaperCommunity</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const Tag = link.external ? 'a' : Link;
            const extraProps = link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
            return (
              <Tag
                key={link.href}
                href={link.href}
                {...extraProps}
                className="inline-flex items-center rounded-xl px-4 py-2 text-[13px] font-semibold no-underline transition"
                style={{
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--surface-strong)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--purple-pale)';
                  e.currentTarget.style.color = 'var(--purple)';
                  e.currentTarget.style.background = 'var(--purple-ghost)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'var(--surface-strong)';
                }}
              >
                {link.label}
              </Tag>
            );
          })}

          {loading ? null : user ? (
            <div className="relative ml-1">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border px-2 py-1 pr-3 transition hover:bg-purple-ghost"
                style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
              >
                <Avatar name={profile?.display_name || 'U'} size="sm" />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{profile?.display_name || 'User'}</span>
                <svg className="h-3 w-3" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border bg-white/95 p-2 shadow-elevated" style={{ borderColor: 'var(--border-subtle)' }}>
                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setDropdownOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm no-underline transition hover:bg-purple-ghost"
                    style={{ color: 'var(--foreground)' }}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm no-underline transition hover:bg-purple-ghost"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Settings
                  </Link>
                  <div className="my-1 h-px" style={{ background: 'var(--border-subtle)' }} />
                  <button
                    onClick={() => { signOut(); setDropdownOpen(false); }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link href="/auth/signin" className="btn btn-secondary text-sm no-underline">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn btn-primary text-sm no-underline">
                Join Community
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-white px-4 py-4 md:hidden" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Tag = link.external ? 'a' : Link;
              const extraProps = link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
              return (
                <Tag
                  key={link.href}
                  href={link.href}
                  {...extraProps}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm no-underline hover:bg-purple-ghost"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {link.label}
                </Tag>
              );
            })}
            {!loading && !user && (
              <>
                <Link href="/auth/signin" className="rounded-lg px-3 py-2 text-sm no-underline hover:bg-purple-ghost" style={{ color: 'var(--text-muted)' }}>
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn btn-primary mt-2 text-center text-sm no-underline">
                  Join Community
                </Link>
              </>
            )}
            {!loading && user && (
              <>
                <Link href={`/profile/${user.id}`} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm no-underline hover:bg-purple-ghost" style={{ color: 'var(--text-muted)' }}>
                  My Profile
                </Link>
                <Link href="/settings" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm no-underline hover:bg-purple-ghost" style={{ color: 'var(--text-muted)' }}>
                  Settings
                </Link>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
