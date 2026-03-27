'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useMessageStore, STAFF_IDS } from '@/stores/messageStore';
import { createClient } from '@/lib/supabase/client';
import Avatar from '@/components/shared/Avatar';
import { PageLoading } from '@/components/shared/LoadingSpinner';
import { isMod } from '@/lib/blog';

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

function formatMessageTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDateSeparator(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return 'Today';
  if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    ...(now.getFullYear() !== date.getFullYear() ? { year: 'numeric' } : {}),
  });
}

function MessagesContent() {
  const { user, loading: authLoading } = useRequireAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const toParam = searchParams.get('to');

  const {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markConversationRead,
    fetchUnreadTotal,
  } = useMessageStore();

  const [selectedPartner, setSelectedPartner] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeQuery, setComposeQuery] = useState('');
  const [composeResults, setComposeResults] = useState([]);
  const [composeSearching, setComposeSearching] = useState(false);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const composeInputRef = useRef(null);
  const composeTimerRef = useRef(null);
  const isInitialLoad = useRef(true);

  const isCurrentMod = isMod(user?.id);

  // Prevent body scroll while messages page is mounted
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Compose search — debounced profile lookup
  useEffect(() => {
    if (!showCompose || composeQuery.trim().length < 2) {
      setComposeResults([]);
      return;
    }
    clearTimeout(composeTimerRef.current);
    composeTimerRef.current = setTimeout(async () => {
      setComposeSearching(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .ilike('display_name', `%${composeQuery.trim()}%`)
          .neq('id', user.id)
          .limit(10);
        setComposeResults(data || []);
      } catch { setComposeResults([]); }
      setComposeSearching(false);
    }, 300);
    return () => clearTimeout(composeTimerRef.current);
  }, [composeQuery, showCompose, user?.id]);

  const selectComposeUser = (profile) => {
    setSelectedPartner(profile);
    setMobileShowThread(true);
    fetchMessages(profile.id);
    markConversationRead(profile.id);
    router.replace(`/messages?to=${profile.id}`, { scroll: false });
    setShowCompose(false);
    setComposeQuery('');
    setComposeResults([]);
  };

  // Load conversations on mount
  useEffect(() => {
    if (user) fetchConversations();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle ?to= param (deep link from profile or other pages)
  useEffect(() => {
    if (toParam && user && toParam !== user.id) {
      loadPartner(toParam);
    }
  }, [toParam, user]);

  const loadPartner = useCallback(async (partnerId) => {
    const existing = conversations.find((c) => c.partnerId === partnerId);
    if (existing) {
      setSelectedPartner(existing.partner);
    } else {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', partnerId)
        .single();
      if (data) setSelectedPartner(data);
    }
    setMobileShowThread(true);
    fetchMessages(partnerId);
    markConversationRead(partnerId);
  }, [conversations]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectConversation = (conv) => {
    setSelectedPartner(conv.partner);
    setMobileShowThread(true);
    fetchMessages(conv.partnerId);
    markConversationRead(conv.partnerId);
    router.replace(`/messages?to=${conv.partnerId}`, { scroll: false });
  };

  // Scroll to bottom of messages container when messages change
  useEffect(() => {
    if (isInitialLoad.current) {
      // Instant scroll on initial load
      const el = messagesContainerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
      if (messages.length > 0) isInitialLoad.current = false;
    } else {
      // Smooth scroll for new messages
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Reset initial load flag when partner changes
  useEffect(() => {
    isInitialLoad.current = true;
  }, [selectedPartner]);

  // Focus input when partner selected
  useEffect(() => {
    if (selectedPartner) inputRef.current?.focus();
  }, [selectedPartner]);

  const handleSend = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!newMessage.trim() || !selectedPartner || sending) return;

    setSending(true);
    try {
      await sendMessage(selectedPartner.id, newMessage);
      setNewMessage('');
      if (inputRef.current) inputRef.current.style.height = 'auto';
      fetchUnreadTotal();
    } catch (err) {
      console.error('[messages] send error:', err);
    } finally {
      setSending(false);
    }
  };

  if (authLoading) return <PageLoading />;

  return (
    <div
      className="-mx-4 -mt-6 -mb-20 flex flex-col pb-16 sm:-mx-6 lg:-mx-8 lg:-mb-6 lg:pb-0"
      style={{ height: 'calc(100dvh - 73px)', overflow: 'hidden' }}
    >
      <div
        className="flex flex-1 overflow-hidden border-t"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
      >
        {/* Conversation List */}
        <div
          className={`w-full flex-shrink-0 border-r md:w-80 lg:w-96 md:block ${mobileShowThread ? 'hidden' : 'block'}`}
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-sm font-semibold text-foreground">Messages</p>
            {isCurrentMod && (
              <button
                onClick={() => { setShowCompose(true); setTimeout(() => composeInputRef.current?.focus(), 100); }}
                className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-purple-ghost"
                style={{ color: 'var(--purple)' }}
                title="New message"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </button>
            )}
          </div>

          {/* Compose search overlay for mods */}
          {showCompose && (
            <div className="border-b px-3 py-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--background)' }}>
              <div className="relative">
                <input
                  ref={composeInputRef}
                  type="text"
                  value={composeQuery}
                  onChange={(e) => setComposeQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
                  onKeyDown={(e) => { if (e.key === 'Escape') { setShowCompose(false); setComposeQuery(''); setComposeResults([]); } }}
                />
                <button
                  onClick={() => { setShowCompose(false); setComposeQuery(''); setComposeResults([]); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-subtle hover:text-foreground"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {composeSearching && (
                <p className="mt-2 text-xs text-text-subtle">Searching...</p>
              )}
              {composeResults.length > 0 && (
                <div className="mt-1 max-h-48 overflow-y-auto">
                  {composeResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectComposeUser(p)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-purple-ghost"
                    >
                      <Avatar name={p.display_name} avatarUrl={p.avatar_url} size="xs" />
                      <span className="text-sm text-foreground">{p.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
              {composeQuery.trim().length >= 2 && !composeSearching && composeResults.length === 0 && (
                <p className="mt-2 text-xs text-text-subtle">No users found</p>
              )}
            </div>
          )}

          <div className="overflow-y-auto" style={{ height: 'calc(100% - 49px)' }}>
            {loading && conversations.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <svg className="h-5 w-5 animate-spin" style={{ color: 'var(--purple)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <svg className="mb-3 h-12 w-12 text-text-subtle" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <p className="text-sm font-medium text-foreground">No messages yet</p>
                <p className="mt-1 text-xs text-text-muted">
                  Your conversations will appear here
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedPartner?.id === conv.partnerId;
                const hasUnread = conv.unreadCount > 0;
                return (
                  <button
                    key={conv.partnerId}
                    onClick={() => selectConversation(conv)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-purple-ghost"
                    style={{
                      background: isSelected ? 'var(--purple-ghost)' : undefined,
                      borderLeft: isSelected ? '3px solid var(--purple)' : '3px solid transparent',
                    }}
                  >
                    <Link href={`/profile/${conv.partnerId}`} onClick={(e) => e.stopPropagation()} className="shrink-0 transition hover:opacity-80">
                      <Avatar
                        name={conv.partner.display_name}
                        avatarUrl={conv.partner.avatar_url}
                        size="sm"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`truncate text-sm ${hasUnread ? 'font-bold' : 'font-semibold'} text-foreground`}>
                          {conv.partner.display_name}
                        </p>
                        {conv.lastMessage && (
                          <span className="ml-2 flex-shrink-0 text-[10px] text-text-subtle">
                            {timeAgo(conv.lastMessage.created_at)}
                          </span>
                        )}
                      </div>
                      <p className={`line-clamp-2 text-sm leading-snug ${hasUnread ? 'font-medium text-foreground' : 'text-text-muted'}`}>
                        {conv.lastMessage
                          ? `${conv.lastMessage.from_user_id === user.id ? 'You: ' : ''}${conv.lastMessage.body}`
                          : 'Start a conversation'}
                      </p>
                    </div>
                    {hasUnread && (
                      <span
                        className="flex h-5 min-w-[20px] flex-shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                        style={{ background: 'var(--purple)' }}
                      >
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className={`flex flex-1 flex-col ${mobileShowThread ? 'block' : 'hidden md:flex'}`}>
          {selectedPartner ? (
            <>
              {/* Thread Header */}
              <div
                className="flex items-center gap-3 border-b px-4 py-3"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <button
                  onClick={() => {
                    setMobileShowThread(false);
                    router.replace('/messages', { scroll: false });
                  }}
                  className="text-text-muted md:hidden"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <Link href={`/profile/${selectedPartner.id}`} className="flex items-center gap-3 transition hover:opacity-80">
                  <Avatar
                    name={selectedPartner.display_name}
                    avatarUrl={selectedPartner.avatar_url}
                    size="sm"
                  />
                  <p className="text-sm font-semibold text-foreground">{selectedPartner.display_name}</p>
                </Link>
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4">
                {messages.length === 0 && !loading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4">
                      <Avatar name={selectedPartner.display_name} avatarUrl={selectedPartner.avatar_url} size="lg" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{selectedPartner.display_name}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      This is the beginning of your conversation
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      let lastDate = null;
                      return messages.map((msg) => {
                        const msgDate = new Date(msg.created_at).toDateString();
                        const showSeparator = msgDate !== lastDate;
                        lastDate = msgDate;
                        const isMine = msg.from_user_id === user.id;
                        return (
                          <React.Fragment key={msg.id}>
                            {showSeparator && (
                              <div className="flex items-center gap-3 py-2">
                                <div className="flex-1 border-t" style={{ borderColor: 'var(--border-subtle)' }} />
                                <span className="text-[11px] font-medium text-text-subtle">
                                  {formatDateSeparator(msg.created_at)}
                                </span>
                                <div className="flex-1 border-t" style={{ borderColor: 'var(--border-subtle)' }} />
                              </div>
                            )}
                            <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <div
                                className="max-w-[75%] rounded-2xl px-4 py-2.5"
                                style={{
                                  background: isMine ? 'var(--purple)' : 'var(--purple-ghost)',
                                  color: isMine ? 'white' : 'var(--foreground)',
                                }}
                              >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                                <p
                                  className="mt-1 text-[10px]"
                                  style={{ opacity: 0.6 }}
                                >
                                  {formatMessageTime(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      });
                    })()}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      background: 'var(--background)',
                      maxHeight: '120px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white transition disabled:opacity-40"
                    style={{ background: 'var(--purple)' }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-text-subtle">
                  Enter to send, Shift+Enter for new line
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="px-6 text-center">
                <svg className="mx-auto h-16 w-16 text-text-subtle" fill="none" viewBox="0 0 24 24" strokeWidth={0.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <p className="mt-4 text-sm font-medium text-foreground">Your Messages</p>
                <p className="mt-1 text-xs text-text-muted">
                  Select a conversation to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <MessagesContent />
    </Suspense>
  );
}
