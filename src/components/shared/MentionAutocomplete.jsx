'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Avatar from './Avatar';

function getMentionQuery(text, cursorPos) {
  const before = text.slice(0, cursorPos);
  const match = before.match(/@(\w*)$/);
  if (!match) return null;
  return { query: match[1], start: match.index, end: cursorPos };
}

// Sort results: prefix matches first, then substring matches
function sortByRelevance(users, query) {
  if (!query) return users;
  const q = query.toLowerCase();
  const prefix = [];
  const substring = [];
  for (const u of users) {
    const dn = (u.display_name || '').toLowerCase();
    const un = (u.username || '').toLowerCase();
    if (dn.startsWith(q) || un.startsWith(q)) {
      prefix.push(u);
    } else {
      substring.push(u);
    }
  }
  return [...prefix, ...substring];
}

// Deduplicate by user id
function dedup(users) {
  const seen = new Set();
  return users.filter((u) => {
    if (seen.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });
}

const CACHE_TTL = 30_000; // 30 seconds
const MAX_RESULTS = 6;

export default function MentionAutocomplete({ textareaRef, value, onChange }) {
  const [results, setResults] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mentionRange, setMentionRange] = useState(null);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const cacheRef = useRef({});
  const abortRef = useRef(null);
  const currentQueryRef = useRef(null);

  const search = useCallback(async (query) => {
    const q = (query || '').trim();
    currentQueryRef.current = q;

    // Check cache first
    const cached = cacheRef.current[q];
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      const sorted = sortByRelevance(cached.data, q);
      setResults(sorted.slice(0, MAX_RESULTS));
      setActiveIndex(0);
      setVisible(true);
      setLoading(false);
      return;
    }

    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) console.time(`mention-search: "${q}"`);

    try {
      const supabase = createClient();
      let queryBuilder = supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url')
        .limit(12);

      if (q.length === 0) {
        // Default: most active users
        queryBuilder = queryBuilder.order('post_count', { ascending: false });
      } else {
        // Search both display_name and username
        queryBuilder = queryBuilder.or(
          `display_name.ilike.${q}%,username.ilike.${q}%,display_name.ilike.%${q}%,username.ilike.%${q}%`
        );
      }

      const { data, error } = await queryBuilder.abortSignal(controller.signal);

      if (isDev) console.timeEnd(`mention-search: "${q}"`);

      if (error) {
        if (error.name === 'AbortError' || error.message?.includes('abort')) return;
        throw error;
      }

      // Guard against stale responses
      if (currentQueryRef.current !== q) return;

      const users = dedup(data || []);
      cacheRef.current[q] = { data: users, ts: Date.now() };

      const sorted = sortByRelevance(users, q);
      setResults(sorted.slice(0, MAX_RESULTS));
      setActiveIndex(0);
      setVisible(true);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      // Silently fail — dropdown just won't show
    } finally {
      if (currentQueryRef.current === q) setLoading(false);
    }
  }, []);

  const handleInput = useCallback(() => {
    const textarea = textareaRef?.current;
    if (!textarea) return;

    const mention = getMentionQuery(textarea.value, textarea.selectionStart);
    if (!mention) {
      setVisible(false);
      setMentionRange(null);
      setResults([]);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    setMentionRange(mention);
    setVisible(true); // Show immediately (loading state or cached results)

    const q = mention.query;

    // Show cached results instantly if available
    const cached = cacheRef.current[q];
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      const sorted = sortByRelevance(cached.data, q);
      setResults(sorted.slice(0, MAX_RESULTS));
      setActiveIndex(0);
    }

    // For empty query (just "@"), search immediately. Otherwise debounce.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length === 0) {
      search(q);
    } else {
      debounceRef.current = setTimeout(() => search(q), 150);
    }
  }, [textareaRef, search]);

  // Listen for input events on the textarea
  useEffect(() => {
    const textarea = textareaRef?.current;
    if (!textarea) return;

    const handler = () => handleInput();
    textarea.addEventListener('input', handler);
    textarea.addEventListener('click', handler);
    return () => {
      textarea.removeEventListener('input', handler);
      textarea.removeEventListener('click', handler);
    };
  }, [textareaRef, handleInput]);

  // Close on click outside
  useEffect(() => {
    if (!visible) return;
    const handleMouseDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setVisible(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [visible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      cacheRef.current = {};
    };
  }, []);

  const selectUser = useCallback((user) => {
    if (!mentionRange) return;
    const before = value.slice(0, mentionRange.start);
    const after = value.slice(mentionRange.end);
    const mention = `@[${user.display_name}](${user.id}) `;
    const newValue = before + mention + after;
    onChange(newValue);
    setVisible(false);
    setMentionRange(null);
    setResults([]);

    // Restore cursor after the mention
    const newCursor = mentionRange.start + mention.length;
    requestAnimationFrame(() => {
      const textarea = textareaRef?.current;
      if (textarea) {
        textarea.selectionStart = newCursor;
        textarea.selectionEnd = newCursor;
        textarea.focus();
      }
    });
  }, [mentionRange, value, onChange, textareaRef]);

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;
    const textarea = textareaRef?.current;
    if (!textarea) return;

    const handleKeyDown = (e) => {
      if (results.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (results.length > 0 && results[activeIndex]) {
          e.preventDefault();
          selectUser(results[activeIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setVisible(false);
      }
    };

    textarea.addEventListener('keydown', handleKeyDown);
    return () => textarea.removeEventListener('keydown', handleKeyDown);
  }, [visible, results, activeIndex, selectUser, textareaRef]);

  if (!visible) return null;

  const showNoResults = !loading && results.length === 0 && mentionRange && mentionRange.query.length > 0;
  const showLoading = loading && results.length === 0;

  return (
    <div
      ref={containerRef}
      className="absolute z-50 mt-1 w-full max-w-[18rem] overflow-hidden rounded-xl border bg-white shadow-lg"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      {showLoading && (
        <div className="flex items-center gap-2 px-3 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--purple)', borderTopColor: 'transparent' }} />
          Searching...
        </div>
      )}
      {results.map((user, idx) => (
        <button
          key={user.id}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            selectUser(user);
          }}
          onMouseEnter={() => setActiveIndex(idx)}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition"
          style={{
            background: idx === activeIndex ? 'var(--purple-ghost)' : 'transparent',
            color: 'var(--foreground)',
          }}
        >
          <Avatar name={user.display_name} avatarUrl={user.avatar_url} size="sm" />
          <div className="min-w-0 flex-1">
            <span className="block truncate font-medium">{user.display_name}</span>
            {user.username && (
              <span className="block truncate text-xs" style={{ color: 'var(--text-muted)' }}>@{user.username}</span>
            )}
          </div>
        </button>
      ))}
      {loading && results.length > 0 && (
        <div className="border-t px-3 py-1.5 text-center text-xs" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
          Updating...
        </div>
      )}
      {showNoResults && (
        <div className="px-3 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>No users found</div>
      )}
    </div>
  );
}
