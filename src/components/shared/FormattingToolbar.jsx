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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

async function uploadImageFile(file, textareaRef, value, onChange, setUploading) {
  if (file.size > MAX_IMAGE_SIZE) {
    alert('Image must be under 5MB');
    return;
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    alert('Only JPG, PNG, GIF, and WebP images are allowed');
    return;
  }

  setUploading(true);
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name?.split('.').pop() || file.type.split('/')[1] || 'png';
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('post-images')
      .upload(path, file, { contentType: file.type });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(path);

    const textarea = textareaRef.current;
    const cursor = textarea ? textarea.selectionStart : (value?.length || 0);
    const imageMarkdown = `\n![image](${publicUrl})\n`;
    const currentValue = textarea ? textarea.value : (value || '');
    const newBody = currentValue.slice(0, cursor) + imageMarkdown + currentValue.slice(cursor);
    onChange(newBody);

    if (textarea) {
      setTimeout(() => {
        textarea.selectionStart = cursor + imageMarkdown.length;
        textarea.selectionEnd = cursor + imageMarkdown.length;
        textarea.focus();
      }, 0);
    }
  } catch (err) {
    console.error('[image-upload]', err);
    alert('Failed to upload image. Please try again.');
  } finally {
    setUploading(false);
  }
}

export function makeImagePasteHandler(textareaRef, getValue, onChange, setUploading) {
  return async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageItem = Array.from(items).find((item) => item.type.startsWith('image/'));
    if (!imageItem) return;

    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;

    await uploadImageFile(file, textareaRef, getValue(), onChange, setUploading);
  };
}

export function makeImageDropHandler(textareaRef, getValue, onChange, setUploading) {
  return async (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    e.preventDefault();
    await uploadImageFile(file, textareaRef, getValue(), onChange, setUploading);
  };
}

export function preventDefaultDrag(e) {
  if (e.dataTransfer?.types?.includes('Files')) {
    e.preventDefault();
  }
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

  const handleLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end);

    const url = prompt('Enter URL:', 'https://');
    if (!url) return;

    const linkText = selected || 'link text';
    const markdown = `[${linkText}](${url})`;
    const newValue = textarea.value.slice(0, start) + markdown + textarea.value.slice(end);
    onChange(newValue);

    setTimeout(() => {
      if (selected) {
        textarea.selectionStart = start + markdown.length;
        textarea.selectionEnd = start + markdown.length;
      } else {
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = start + 1 + linkText.length;
      }
      textarea.focus();
    }, 0);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImageFile(file, textareaRef, value, onChange, setUploading);
    e.target.value = '';
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
        className="rounded px-2.5 py-1.5 text-sm font-bold transition active:bg-purple-ghost/50 sm:px-2 sm:py-0.5 sm:hover:bg-purple-ghost/50"
        style={{ color: 'var(--text-muted)' }}
        title="Bold"
      >
        B
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => wrapSelection('*')}
        className="rounded px-2.5 py-1.5 text-sm italic transition active:bg-purple-ghost/50 sm:px-2 sm:py-0.5 sm:hover:bg-purple-ghost/50"
        style={{ color: 'var(--text-muted)' }}
        title="Italic"
      >
        I
      </button>

      {/* Bullet list */}
      <button
        type="button"
        onClick={handleBulletList}
        className="rounded px-2.5 py-1.5 text-sm transition active:bg-purple-ghost/50 sm:px-2 sm:py-0.5 sm:hover:bg-purple-ghost/50"
        style={{ color: 'var(--text-muted)' }}
        title="Bullet list"
      >
        •≡
      </button>

      {/* Link */}
      <button
        type="button"
        onClick={handleLink}
        className="rounded px-2.5 py-1.5 text-sm transition active:bg-purple-ghost/50 sm:px-2 sm:py-0.5 sm:hover:bg-purple-ghost/50"
        style={{ color: 'var(--text-muted)' }}
        title="Insert link"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.504a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374" />
        </svg>
      </button>

      {/* Image upload */}
      <label
        className="cursor-pointer rounded px-2.5 py-1.5 text-sm transition active:bg-purple-ghost/50 sm:px-2 sm:py-0.5 sm:hover:bg-purple-ghost/50"
        style={{ color: 'var(--text-muted)' }}
        title="Add image"
      >
        {uploading ? (
          <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>Uploading…</span>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
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
