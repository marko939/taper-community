'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
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

export function NotificationItem({ notification, onClick }) {
  const isBadge = notification.type === 'badge';

  return (
    <button
      onClick={() => onClick(notification)}
      className="flex w-full items-start gap-3 px-4 py-3 text-left transition active:bg-purple-ghost/50"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      {/* Unread indicator */}
      <div className="mt-2 flex-shrink-0">
        {!notification.read && (
          <div className="h-2 w-2 rounded-full" style={{ background: 'var(--purple)' }} />
        )}
        {notification.read && <div className="h-2 w-2" />}
      </div>

      <div className="min-w-0 flex-1">
        {isBadge ? (
          <p className="text-sm font-medium text-foreground">{notification.title}</p>
        ) : (
          <>
            <p className="text-sm text-foreground">
              <span className="font-semibold">{notification.actor?.display_name || 'Someone'}</span>
              {' '}
              {notification.type === 'reply_mention'
                ? 'mentioned you in'
                : notification.type === 'post_like'
                  ? 'liked your post in'
                  : notification.type === 'new_follower'
                    ? 'started following you'
                    : notification.type === 'forum_new_thread'
                      ? 'posted in'
                      : 'replied to'}
              {notification.thread?.title && (
                <>
                  {' '}
                  <span className="font-medium" style={{ color: 'var(--purple)' }}>
                    &ldquo;{notification.thread.title}&rdquo;
                  </span>
                </>
              )}
            </p>
            {notification.body && (
              <p className="mt-1 line-clamp-2 text-xs text-text-muted">{notification.body}</p>
            )}
          </>
        )}
        <p className="mt-1 text-xs text-text-subtle">{timeAgo(notification.created_at)}</p>
      </div>
    </button>
  );
}

export default function NotificationPanel({ onClose }) {
  const router = useRouter();
  const sheetRef = useRef(null);

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const loading = useNotificationStore((s) => s.loading);

  // Swipe-to-dismiss state
  const touchStartY = useRef(0);
  const translateY = useRef(0);

  useEffect(() => {
    useNotificationStore.getState().fetchNotifications();
  }, []);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0) {
      translateY.current = dy;
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${dy}px)`;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (translateY.current > 120) {
      onClose();
    } else {
      if (sheetRef.current) {
        sheetRef.current.style.transform = 'translateY(0)';
        sheetRef.current.style.transition = 'transform 0.2s ease-out';
        setTimeout(() => {
          if (sheetRef.current) sheetRef.current.style.transition = '';
        }, 200);
      }
    }
    translateY.current = 0;
  }, [onClose]);

  const handleNotifClick = useCallback((n) => {
    if (!n.read) useNotificationStore.getState().markAsRead(n.id);
    if (n.type === 'new_follower' && n.actor_id) {
      onClose();
      router.push(`/profile/${n.actor_id}`);
    } else if (n.thread_id) {
      onClose();
      const hash = n.reply_id ? `#reply-${n.reply_id}` : '';
      router.push(`/thread/${n.thread_id}${hash}`);
    }
  }, [router, onClose]);

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div
        ref={sheetRef}
        className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl"
        style={{
          background: 'var(--surface-strong)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex items-center justify-center py-3"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="h-1 w-10 rounded-full" style={{ background: 'var(--border-subtle)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-base font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => useNotificationStore.getState().markAllAsRead()}
              className="text-xs font-medium active:opacity-70"
              style={{ color: 'var(--purple)' }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notification list — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">No notifications yet.</div>
          ) : (
            notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onClick={handleNotifClick} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
