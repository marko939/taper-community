'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ReplyForm({ threadId, onReplyAdded }) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthChecked(true);
    });
  }, []);

  if (authChecked && !user) {
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
    const { data, error } = await supabase
      .from('replies')
      .insert({ thread_id: threadId, user_id: user.id, body: body.trim() })
      .select('*, profiles:user_id(display_name, is_peer_advisor, drug, taper_stage, post_count, drug_signature)')
      .single();

    if (!error && data) {
      onReplyAdded(data);
      setBody('');
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
