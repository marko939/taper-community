'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Avatar from './Avatar';

// Match @word at cursor position (no spaces in partial, must be at end of text before cursor)
function getMentionQuery(text, cursorPos) {
  const before = text.slice(0, cursorPos);
  const match = before.match(/@(\w*)$/);
  if (!match) return null;
  return { query: match[1], start: match.index, end: cursorPos };
}

export default function MentionAutocomplete({ textareaRef, value, onChange }) {
  const [results, setResults] = useState([]);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mentionRange, setMentionRange] = useState(null);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  const search = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setResults([]);
      setVisible(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .ilike('display_name', `%${query}%`)
      .limit(6);
    if (data && data.length > 0) {
      setResults(data);
      setActiveIndex(0);
      setVisible(true);
    } else {
      setResults([]);
      setVisible(false);
    }
  }, []);

  const handleInput = useCallback(() => {
    const textarea = textareaRef?.current;
    if (!textarea) return;

    const mention = getMentionQuery(textarea.value, textarea.selectionStart);
    if (!mention) {
      setVisible(false);
      setMentionRange(null);
      return;
    }

    setMentionRange(mention);

    // Debounce the search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(mention.query), 300);
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

  const selectUser = useCallback((user) => {
    if (!mentionRange) return;
    const before = value.slice(0, mentionRange.start);
    const after = value.slice(mentionRange.end);
    const mention = `@[${user.display_name}](${user.id}) `;
    const newValue = before + mention + after;
    onChange(newValue);
    setVisible(false);
    setMentionRange(null);

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
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (results[activeIndex]) {
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

  if (!visible || results.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute z-50 mt-1 w-full max-w-[16rem] overflow-hidden rounded-xl border bg-white shadow-lg"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
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
          <span className="truncate font-medium">{user.display_name}</span>
        </button>
      ))}
    </div>
  );
}
