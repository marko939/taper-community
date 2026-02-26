'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useThreadStore } from '@/stores/threadStore';

export default function QuoteToolbar() {
  const setQuote = useThreadStore((s) => s.setQuote);
  const [toolbar, setToolbar] = useState(null); // { text, author, x, y }
  const toolbarRef = useRef(null);
  const timerRef = useRef(null);

  const handleMouseUp = useCallback(() => {
    // Delay to let selection finalize
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        return;
      }

      const text = selection.toString().trim();
      if (!text) return;

      // Check if selection is within a [data-quotable] element
      let node = selection.anchorNode;
      let quotableEl = null;
      while (node) {
        if (node.nodeType === 1 && node.hasAttribute?.('data-quotable')) {
          quotableEl = node;
          break;
        }
        node = node.parentElement;
      }

      if (!quotableEl) return;

      const author = quotableEl.getAttribute('data-author') || 'Anonymous';
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setToolbar({
        text,
        author,
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      });
    }, 10);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setToolbar(null);
  }, []);

  const handleMouseDown = useCallback((e) => {
    // If clicking the toolbar itself, don't dismiss
    if (toolbarRef.current && toolbarRef.current.contains(e.target)) return;
    // Dismiss toolbar on any other click
    setToolbar(null);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleMouseUp, handleKeyDown, handleMouseDown]);

  if (!toolbar) return null;

  const handleQuote = () => {
    let quoted = toolbar.text;
    if (quoted.length > 280) {
      quoted = quoted.slice(0, 277) + '...';
    }
    const formatted = `> "${quoted}"\n> — @${toolbar.author}\n\n`;
    setQuote(formatted);
    setToolbar(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div
      ref={toolbarRef}
      data-quote-toolbar
      className="fixed z-50 -translate-x-1/2 -translate-y-full"
      style={{ left: toolbar.x, top: toolbar.y }}
    >
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleQuote}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold shadow-lg transition hover:opacity-90"
        style={{ background: 'var(--purple)', color: '#fff' }}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
        Quote &amp; Reply
      </button>
    </div>
  );
}
