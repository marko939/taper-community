'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useThreadStore } from '@/stores/threadStore';

export default function ReplyForm({ threadId }) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const addReply = useThreadStore((s) => s.addReply);

  if (!authLoading && !user) {
    return (
      <div className="card text-center">
        <p className="text-text-muted">
          <Link href="/auth/signin" className="font-medium text-accent-blue hover:underline">Sign in</Link> to reply to this thread.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const result = await Promise.race([
        addReply(threadId, body),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
      ]);

      if (result) {
        setBody('');
      } else {
        setError('Reply could not be posted. Please try again.');
      }
    } catch (err) {
      if (err?.message === 'timeout') {
        setError('Posting timed out. Please try again.');
      } else {
        setError(err?.message || 'Failed to post reply. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Write a Reply</h3>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your thoughts or experience..."
        rows={4}
        className="textarea"
        required
      />
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="btn btn-primary disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Reply'}
        </button>
      </div>
    </form>
  );
}
