'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

export default function NotificationDropdown({ onClose }) {
  const router = useRouter();
  const ref = useRef(null);
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead, unreadCount } =
    useNotificationStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.thread_id) {
      onClose();
      const hash = notification.reply_id ? `#reply-${notification.reply_id}` : '';
      router.push(`/thread/${notification.thread_id}${hash}`);
    }
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-80 rounded-2xl border bg-white/95 shadow-elevated overflow-hidden"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
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
      <div className="max-h-80 overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-subtle)' }}>
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-subtle)' }}>
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => {
            const isBadge = n.type === 'badge';
            return (
              <button
                key={n.id}
                onClick={() => isBadge ? (!n.read && markAsRead(n.id)) : handleClick(n)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${isBadge ? '' : 'hover:bg-purple-ghost'}`}
                style={{
                  background: n.read ? 'transparent' : 'var(--purple-ghost)',
                  borderBottom: '1px solid var(--border-subtle)',
                  cursor: isBadge ? 'default' : 'pointer',
                }}
              >
                <div className="flex-1 min-w-0">
                  {isBadge ? (
                    <p className="text-sm leading-snug" style={{ color: 'var(--foreground)' }}>
                      {n.title}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm leading-snug" style={{ color: 'var(--foreground)' }}>
                        <span className="font-semibold">{n.actor?.display_name || 'Someone'}</span>
                        {' replied to '}
                        <span className="font-medium">&ldquo;{(n.thread?.title || '').slice(0, 50)}{(n.thread?.title || '').length > 50 ? '...' : ''}&rdquo;</span>
                      </p>
                      {n.body && (
                        <p className="mt-0.5 text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {n.body}
                        </p>
                      )}
                    </>
                  )}
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-subtle)' }}>
                    {timeAgo(n.created_at)}
                  </p>
                </div>
                {!n.read && (
                  <div
                    className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: 'var(--purple)' }}
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
