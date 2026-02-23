'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/shared/Avatar';

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    exact: true,
  },
  {
    href: '/journal',
    label: 'My Taper',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    href: '/forums',
    label: 'Forums',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
  {
    href: '/education',
    label: 'Learn',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    href: '/drugs',
    label: 'Drug Profiles',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    href: '/deprescribers',
    label: 'Find a Provider',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
];


export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();

  const isActive = (item) =>
    !item.external && (item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + '/'));

  return (
    <>
      {/* ── Mobile top bar ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between border-b px-4 py-3 lg:hidden"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
      >
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Image src="/tapercommunity-logo.png" alt="TaperCommunity" width={28} height={28} />
          <span className="text-lg font-semibold" style={{ fontFamily: 'Fraunces, Georgia, serif', color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
            TaperCommunity
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 transition hover:bg-purple-ghost"
          style={{ color: 'var(--text-muted)' }}
        >
          {mobileOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </header>

      {/* ── Mobile dropdown menu ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-[57px] z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="border-b shadow-lg"
            style={{ background: 'var(--surface-strong)', borderColor: 'var(--border-subtle)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-1 px-3 py-3">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 no-underline transition hover:bg-purple-ghost"
                  style={{
                    color: isActive(item) ? 'var(--purple)' : 'var(--text-muted)',
                    background: isActive(item) ? 'var(--purple-ghost)' : 'transparent',
                  }}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
            {!loading && (
              <div className="border-t px-3 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
                {user ? (
                  <>
                    <Link
                      href={`/profile/${user.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 no-underline transition hover:bg-purple-ghost"
                    >
                      <Avatar name={profile?.display_name || 'U'} avatarUrl={profile?.avatar_url} size="sm" />
                      <span className="text-sm font-medium text-foreground">{profile?.display_name || 'User'}</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setMobileOpen(false)}
                      className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2 no-underline transition hover:bg-purple-ghost"
                      style={{ color: 'var(--text-subtle)' }}
                    >
                      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium">Settings</span>
                    </Link>
                    <button
                      onClick={async () => { await signOut(); setMobileOpen(false); window.location.href = '/'; }}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-purple-ghost"
                      style={{ color: 'var(--text-subtle)' }}
                    >
                      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                      </svg>
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 no-underline transition hover:bg-purple-ghost" style={{ color: 'var(--purple)' }}>
                      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                      <span className="text-sm font-semibold">Sign In</span>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 no-underline transition hover:bg-purple-ghost" style={{ color: 'var(--text-muted)' }}>
                      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
                      <span className="text-sm font-medium">Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside
        className="sticky top-0 hidden h-screen shrink-0 border-r transition-all duration-200 lg:block"
        style={{
          width: collapsed ? '64px' : '220px',
          borderColor: 'var(--border-subtle)',
          background: 'var(--surface-strong)',
        }}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2.5 border-b px-4 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              <Image src="/tapercommunity-logo.png" alt="TaperCommunity" width={28} height={28} className="shrink-0" />
              {!collapsed && (
                <span className="text-lg font-semibold" style={{ fontFamily: 'Fraunces, Georgia, serif', color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                  TaperCommunity
                </span>
              )}
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-1 px-2 py-3">
            {NAV_ITEMS.map((item) => {
              const Tag = item.external ? 'a' : Link;
              const extraProps = item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
              return (
                <Tag
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 no-underline transition hover:bg-purple-ghost"
                  style={{
                    color: isActive(item) ? 'var(--purple)' : 'var(--text-muted)',
                    background: isActive(item) ? 'var(--purple-ghost)' : 'transparent',
                  }}
                  title={collapsed ? item.label : undefined}
                  {...extraProps}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Tag>
              );
            })}
          </nav>

          {/* Collapse toggle */}
          <div className="px-2 py-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-purple-ghost"
              style={{ color: 'var(--text-subtle)' }}
            >
              <svg className={`h-5 w-5 shrink-0 transition ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
              </svg>
              {!collapsed && <span className="text-sm font-medium">Collapse</span>}
            </button>
          </div>

          {/* User */}
          {!loading && user && (
            <div className="border-t px-2 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <Link
                href={`/profile/${user.id}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2 no-underline transition hover:bg-purple-ghost"
              >
                <Avatar name={profile?.display_name || 'U'} avatarUrl={profile?.avatar_url} size="sm" />
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{profile?.display_name || 'User'}</p>
                    <p className="text-[11px] text-text-subtle">View profile</p>
                  </div>
                )}
              </Link>
              <Link
                href="/settings"
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 no-underline transition hover:bg-purple-ghost"
                style={{ color: 'var(--text-subtle)' }}
                title={collapsed ? 'Settings' : undefined}
              >
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {!collapsed && <span className="text-sm font-medium">Settings</span>}
              </Link>
              <button
                onClick={async () => {
                  await signOut();
                  window.location.href = '/';
                }}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-purple-ghost"
                style={{ color: 'var(--text-subtle)' }}
                title={collapsed ? 'Sign Out' : undefined}
              >
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
              </button>
            </div>
          )}

          {!loading && !user && (
            <div className="border-t px-2 py-3 space-y-1" style={{ borderColor: 'var(--border-subtle)' }}>
              <Link
                href="/auth/signin"
                className="flex items-center gap-3 rounded-xl px-3 py-2 no-underline transition hover:bg-purple-ghost"
                style={{ color: 'var(--purple)' }}
              >
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                {!collapsed && <span className="text-sm font-semibold">Sign In</span>}
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-3 rounded-xl px-3 py-2 no-underline transition hover:bg-purple-ghost"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                {!collapsed && <span className="text-sm font-medium">Sign Up</span>}
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
