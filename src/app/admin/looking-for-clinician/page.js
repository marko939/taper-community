'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/lib/blog';
import Link from 'next/link';

export default function LookingForClinicianAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin(user.id)) return;
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, drug, taper_stage, drug_signature, created_at')
      .eq('looking_for_clinician', true)
      .order('created_at', { ascending: false });

    if (!data || data.length === 0) {
      setUsers([]);
      setLoading(false);
      return;
    }

    // Fetch emails via auth admin — use service route
    const ids = data.map((u) => u.id);
    let emailMap = {};
    try {
      const res = await fetch('/api/admin/user-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: ids }),
      });
      if (res.ok) {
        emailMap = await res.json();
      }
    } catch { /* fallback — no emails */ }

    setUsers(data.map((u) => ({ ...u, email: emailMap[u.id] || 'N/A' })));
    setLoading(false);
  };

  if (authLoading) return <p className="p-8 text-text-muted">Loading...</p>;
  if (!user || !isAdmin(user.id)) return <p className="p-8 text-text-muted">Not authorized.</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/analytics" className="text-xs text-purple hover:underline">&larr; Back to Analytics</Link>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-foreground">Looking for a Clinician</h1>
        <p className="mt-1 text-sm text-text-muted">
          {users.length} {users.length === 1 ? 'member' : 'members'} requested help finding a clinician during onboarding.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-text-muted">No members currently looking for a clinician.</p>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-start justify-between rounded-xl border p-4"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {u.avatar_url && (
                    <img src={u.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{u.display_name || 'Anonymous'}</p>
                    <p className="text-xs text-text-muted">{u.email}</p>
                  </div>
                </div>
                {u.drug && (
                  <p className="mt-1.5 text-xs text-text-muted">
                    <span className="font-medium">Medication:</span> {u.drug}
                    {u.taper_stage ? ` — ${u.taper_stage}` : ''}
                  </p>
                )}
                {u.drug_signature && (
                  <p className="mt-0.5 text-xs italic text-text-subtle">{u.drug_signature}</p>
                )}
                <p className="mt-1 text-[10px] text-text-subtle">
                  Joined {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <Link
                href={`/profile/${u.id}`}
                className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium text-purple no-underline transition hover:border-purple"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
