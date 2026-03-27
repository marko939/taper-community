'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
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

  const isCurrentMod = isMod(user?.id);

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
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Focus input when partner selected
  useEffect(() => {
    if (selectedPartner) inputRef.current?.focus();
  }, [selectedPartner]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartner || sending) return;

    setSending(true);
    try {
      await sendMessage(selectedPartner.id, newMessage);
      setNewMessage('');
      fetchUnreadTotal();
    } catch (err) {
      console.error('[messages] send error:', err);
    } finally {
      setSending(false);
    }
  };

  if (authLoading) return <PageLoading />;

  return (
    <div className="mx-auto max-w-4xl">
      <h1
        className="mb-6 text-2xl font-semibold text-foreground"
        style={{ fontFamily: 'Fraunces, Georgia, serif' }}
      >
        Messages
      </h1>

      <div
        className="flex overflow-hidden rounded-xl border"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'var(--surface-strong)',
          height: 'calc(100vh - 200px)',
          minHeight: '500px',
        }}
      >
        {/* Conversation List */}
        <div
          className={`w-full flex-shrink-0 border-r md:w-80 md:block ${mobileShowThread ? 'hidden' : 'block'}`}
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-sm font-semibold text-foreground">Conversations</p>
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
                  placeholder="Search by name…"
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
                <p className="mt-2 text-xs text-text-subtle">Searching…</p>
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
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-text-muted">No messages yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.partnerId}
                  onClick={() => selectConversation(conv)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-purple-ghost ${
                    selectedPartner?.id === conv.partnerId ? 'bg-purple-ghost' : ''
                  }`}
                  style={selectedPartner?.id === conv.partnerId ? { background: 'var(--purple-ghost)' } : {}}
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
                      <p className="truncate text-sm font-semibold text-foreground">
                        {conv.partner.display_name}
                      </p>
                      {conv.lastMessage && (
                        <span className="ml-2 flex-shrink-0 text-[10px] text-text-subtle">
                          {timeAgo(conv.lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-text-muted">
                      {conv.lastMessage
                        ? `${conv.lastMessage.from_user_id === user.id ? 'You: ' : ''}${conv.lastMessage.body}`
                        : 'Start a conversation'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: 'var(--purple)' }}
                    >
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
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
                  <p className="py-8 text-center text-sm text-text-subtle">
                    Start the conversation with {selectedPartner.display_name}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isMine = msg.from_user_id === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
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
                              {timeAgo(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 border-t px-4 py-3"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    background: 'var(--background)',
                    focusRingColor: 'var(--purple)',
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition disabled:opacity-40"
                  style={{ background: 'var(--purple)' }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-text-subtle" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <p className="mt-3 text-sm text-text-muted">Select a conversation</p>
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
