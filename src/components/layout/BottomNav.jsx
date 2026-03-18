'use client';

import { useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import ComposeSheet from '@/components/shared/ComposeSheet';
import NotificationPanel from '@/components/layout/NotificationPanel';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', path: '/' },
  { key: 'search', label: 'Search', path: '/forums' },
  { key: 'post', label: 'Post', path: null },
  { key: 'notifications', label: 'Alerts', path: null },
  { key: 'profile', label: 'Profile', path: null },
];

function NavIcon({ name, active }) {
  const color = active ? 'var(--purple)' : 'var(--text-subtle)';

  switch (name) {
    case 'home':
      return (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      );
    case 'search':
      return (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      );
    case 'post':
      return (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={color}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      );
    case 'notifications':
      return (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      );
    case 'profile':
      return (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [showCompose, setShowCompose] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleTap = useCallback((item) => {
    if (item.key === 'post') {
      if (!user) { router.push('/auth/signin'); return; }
      setShowCompose(true);
      return;
    }
    if (item.key === 'notifications') {
      if (!user) { router.push('/auth/signin'); return; }
      setShowNotifications(true);
      return;
    }
    if (item.key === 'profile') {
      if (!user) { router.push('/auth/signin'); return; }
      router.push(`/profile/${user.id}`);
      return;
    }
    if (item.path) {
      router.push(item.path);
    }
  }, [user, router]);

  const isActive = (item) => {
    if (item.key === 'home') return pathname === '/';
    if (item.key === 'search') return pathname.startsWith('/forums');
    if (item.key === 'profile') return pathname.startsWith('/profile');
    return false;
  };

  return (
    <>
      {/* Bottom navigation bar — mobile only */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t lg:hidden"
        style={{
          background: 'var(--surface-strong)',
          borderColor: 'var(--border-subtle)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.key}
              onClick={() => handleTap(item)}
              className="relative flex min-h-[56px] min-w-[56px] flex-col items-center justify-center gap-0.5 active:scale-95 active:opacity-70"
              aria-label={item.label}
            >
              <div className="relative">
                <NavIcon name={item.key} active={active} />
                {item.key === 'notifications' && unreadCount > 0 && (
                  <span
                    className="absolute -right-1.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                    style={{ background: '#ef4444' }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? 'var(--purple)' : 'var(--text-subtle)' }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Compose sheet overlay */}
      {showCompose && (
        <ComposeSheet onClose={() => setShowCompose(false)} />
      )}

      {/* Notification panel overlay */}
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
}
