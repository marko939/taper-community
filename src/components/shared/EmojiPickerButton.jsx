'use client';

import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import data from '@emoji-mart/data';

const Picker = lazy(() => import('@emoji-mart/react'));

export default function EmojiPickerButton({ textareaRef, value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  const handleSelect = (emoji) => {
    const textarea = textareaRef?.current;
    const native = emoji.native;
    if (!native) return;

    if (textarea) {
      const start = textarea.selectionStart ?? value.length;
      const end = textarea.selectionEnd ?? value.length;
      const newValue = value.slice(0, start) + native + value.slice(end);
      onChange(newValue);

      // Restore cursor position after React re-render
      const newCursor = start + native.length;
      requestAnimationFrame(() => {
        textarea.selectionStart = newCursor;
        textarea.selectionEnd = newCursor;
        textarea.focus();
      });
    } else {
      onChange(value + native);
    }

    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-lg transition hover:bg-purple-ghost/50"
        style={{ color: 'var(--text-subtle)' }}
        aria-label="Insert emoji"
      >
        😊
      </button>
      {open && (
        <div className="absolute bottom-full right-0 z-50 mb-2">
          <Suspense fallback={<div className="rounded-xl border bg-white p-4 text-sm text-text-muted shadow-lg" style={{ borderColor: 'var(--border-subtle)' }}>Loading...</div>}>
            <Picker
              data={data}
              onEmojiSelect={handleSelect}
              theme="light"
              previewPosition="none"
              skinTonePosition="none"
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
