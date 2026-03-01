'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function makeBulletKeyHandler(textareaRef, onChange) {
  return (e) => {
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const val = textarea.value;
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const currentLine = val.slice(lineStart, start);

      if (currentLine === '- ') {
        e.preventDefault();
        const newValue = val.slice(0, lineStart) + val.slice(start);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = lineStart;
          textarea.selectionEnd = lineStart;
        }, 0);
        return;
      }

      if (currentLine.startsWith('- ') && currentLine.trim() !== '-') {
        e.preventDefault();
        const newValue = val.slice(0, start) + '\n- ' + val.slice(start);
        onChange(newValue);
        setTimeout(() => {
          textarea.selectionStart = start + 3;
          textarea.selectionEnd = start + 3;
        }, 0);
      }
    }
  };
}

export default function FormattingToolbar({ textareaRef, value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const wrapSelection = (wrapper) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end);
    const newText =
      textarea.value.slice(0, start) +
      wrapper + selected + wrapper +
      textarea.value.slice(end);
    onChange(newText);
    setTimeout(() => {
      textarea.selectionStart = start + wrapper.length;
      textarea.selectionEnd = end + wrapper.length;
      textarea.focus();
    }, 0);
  };

  const handleBulletList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const val = textarea.value;
    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = val.indexOf('\n', start);
    const currentLine = val.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);

    let newValue;
    let newCursor;

    if (currentLine.startsWith('- ')) {
      newValue = val.slice(0, lineStart) + currentLine.slice(2) + val.slice(lineEnd === -1 ? val.length : lineEnd);
      newCursor = Math.max(lineStart, start - 2);
    } else {
      newValue = val.slice(0, lineStart) + '- ' + val.slice(lineStart);
      newCursor = start + 2;
    }

    onChange(newValue);
    setTimeout(() => {
      textarea.selectionStart = newCursor;
      textarea.selectionEnd = newCursor;
      textarea.focus();
    }, 0);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert('Image must be under 5MB');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Only JPG, PNG, GIF, and WebP images are allowed');
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from('post-images')
        .upload(path, file, { contentType: file.type });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(path);

      const textarea = textareaRef.current;
      if (!textarea) return;

      const imageMarkdown = `\n![image](${publicUrl})\n`;
      const start = textarea.selectionStart;
      const newBody = value.slice(0, start) + imageMarkdown + value.slice(start);
      onChange(newBody);

      setTimeout(() => {
        textarea.selectionStart = start + imageMarkdown.length;
        textarea.selectionEnd = start + imageMarkdown.length;
        textarea.focus();
      }, 0);
    } catch (err) {
      console.error('[image-upload]', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div
      className="flex items-center gap-1 rounded-t-lg border border-b-0 px-3 py-1.5"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-glass)' }}
    >
      {/* Bold */}
      <button
        type="button"
        onClick={() => wrapSelection('**')}
        className="rounded px-2 py-0.5 text-sm font-bold transition hover:bg-purple-ghost/50"
        style={{ color: 'var(--text-muted)' }}
        title="Bold"
      >
        B
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => wrapSelection('*')}
        className="rounded px-2 py-0.5 text-sm italic transition hover:bg-purple-ghost/50"
        style={{ color: 'var(--text-muted)' }}
        title="Italic"
      >
        I
      </button>

      {/* Bullet list */}
      <button
        type="button"
        onClick={handleBulletList}
        className="rounded px-2 py-0.5 text-sm transition hover:bg-purple-ghost/50"
        style={{ color: 'var(--text-muted)' }}
        title="Bullet list"
      >
        •≡
      </button>

      {/* Image upload */}
      <label
        className="cursor-pointer rounded px-2 py-0.5 text-sm transition hover:bg-purple-ghost/50"
        style={{ color: 'var(--text-muted)' }}
        title="Add image"
      >
        {uploading ? (
          <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>Uploading…</span>
        ) : (
          '📷'
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleImageUpload}
          disabled={uploading}
        />
      </label>
    </div>
  );
}
