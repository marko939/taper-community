'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/stores/notificationStore';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationFab() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const hasFetched = useRef(false);

  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    subscribeRealtime,
    unsubscribeRealtime,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  // Initialize on auth
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      subscribeRealtime();
      return () => unsubscribeRealtime();
    }
  }, [user, fetchUnreadCount, subscribeRealtime, unsubscribeRealtime]);

  // Lazy-load full list on first open
  useEffect(() => {
    if (open && !hasFetched.current) {
      hasFetched.current = true;
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleNotifClick = useCallback((n) => {
    if (!n.read) markAsRead(n.id);
    setOpen(false);
    router.push(`/thread/${n.thread_id}`);
  }, [markAsRead, router]);

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
      {/* Expanded panel */}
      {open && (
        <div
          className="mb-3 w-80 rounded-2xl border bg-white shadow-elevated overflow-hidden"
          style={{ borderColor: 'var(--border-subtle)', maxHeight: 'calc(100vh - 120px)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium transition hover:opacity-80"
                style={{ color: 'var(--purple)' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-subtle)' }}>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <svg className="mx-auto h-8 w-8 mb-2" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>No notifications yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-subtle)' }}>
                  You'll be notified when someone replies to your threads
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-purple-ghost"
                  style={{
                    background: n.read ? 'transparent' : 'var(--purple-ghost)',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug" style={{ color: 'var(--foreground)' }}>
                      <span className="font-semibold">{n.actor?.display_name || 'Someone'}</span>
                      {' commented on '}
                      <span className="font-medium">
                        "{(n.thread?.title || n.title || '').slice(0, 50)}
                        {(n.thread?.title || n.title || '').length > 50 ? '...' : ''}"
                      </span>
                    </p>
                    {n.body && (
                      <p
                        className="mt-1 rounded-lg px-2.5 py-1.5 text-xs leading-relaxed"
                        style={{ color: 'var(--text-muted)', background: 'var(--surface-strong)' }}
                      >
                        {n.body.length > 120 ? n.body.slice(0, 120) + '...' : n.body}
                      </p>
                    )}
                    <p className="mt-1.5 text-[11px]" style={{ color: 'var(--text-subtle)' }}>
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                  {!n.read && (
                    <div
                      className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ background: 'var(--purple)' }}
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{
          background: unreadCount > 0 ? 'var(--purple)' : 'var(--foreground)',
          color: 'white',
        }}
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
