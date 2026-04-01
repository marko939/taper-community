'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/metabolic', label: 'Overview', exact: true },
  { href: '/metabolic/diets', label: 'Diet Approaches' },
  { href: '/metabolic/food-guides', label: 'Food Guides' },
  { href: '/metabolic/education', label: 'Education Hub' },
  { href: '/tools/meal-generator', label: 'Meal Generator' },
  { href: '/metabolic/videos', label: 'Videos & Talks' },
];

export default function MetabolicNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (link) => {
    if (link.exact) return pathname === link.href;
    return pathname === link.href || pathname.startsWith(link.href + '/');
  };

  const currentLink = LINKS.find(isActive) || LINKS[0];

  // Close dropdown on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mobileOpen]);

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      {/* ── Desktop: horizontal tabs ── */}
      <nav
        className="mb-6 hidden overflow-x-auto sm:block"
        style={{ background: '#6B4A99', borderRadius: 12 }}
      >
        <div className="flex min-w-max px-6">
          {LINKS.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex-shrink-0 px-4 py-3 text-sm font-medium no-underline transition"
                style={{ color: active ? '#ffffff' : 'rgba(255,255,255,0.65)' }}
              >
                {link.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{ background: '#ffffff' }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Mobile: dropdown selector ── */}
      <div className="relative mb-5 sm:hidden" ref={dropdownRef}>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold"
          style={{
            background: '#6B4A99',
            borderColor: '#6B4A99',
            color: '#fff',
          }}
        >
          <span>{currentLink.label}</span>
          <svg
            className="h-4 w-4 transition-transform"
            style={{ transform: mobileOpen ? 'rotate(180deg)' : 'rotate(0)' }}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {mobileOpen && (
          <div
            className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-xl border shadow-lg"
            style={{ background: 'var(--surface-strong)', borderColor: 'var(--border-subtle)' }}
          >
            {LINKS.map((link) => {
              const active = isActive(link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium no-underline transition"
                  style={{
                    background: active ? 'var(--purple-ghost)' : 'transparent',
                    color: active ? '#6B4A99' : 'var(--text-muted)',
                  }}
                >
                  {active && (
                    <span className="h-2 w-2 rounded-full" style={{ background: '#6B4A99', flexShrink: 0 }} />
                  )}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
