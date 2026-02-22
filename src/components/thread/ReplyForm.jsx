'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useThreadStore } from '@/stores/threadStore';

export default function ReplyForm({ threadId }) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
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
    await addReply(threadId, body);
    setBody('');
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
