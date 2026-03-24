'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/lib/blog';
import Link from 'next/link';

const STATUSES = ['pending', 'contacted', 'matched', 'declined', 'closed'];
const STATUS_COLORS = {
  pending: '#E8A838',
  contacted: '#5B2E91',
  matched: '#34A853',
  declined: '#D64545',
  closed: '#6B6580',
};

export default function LookingForClinicianAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!user || !isAdmin(user.id)) return;
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('clinician_help_requests')
      .select('*, profile:user_id(id, display_name, avatar_url, drug, taper_stage, drug_signature, created_at)')
      .order('created_at', { ascending: false });

    if (error) console.error('[clinician-admin] fetch error:', error);

    if (!data || data.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    // Fallback: if join returned null profiles (FK missing), fetch separately
    let records = data;
    const needsProfileFetch = data.some((r) => !r.profile);
    if (needsProfileFetch) {
      const userIds = [...new Set(data.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, drug, taper_stage, drug_signature, created_at')
        .in('id', userIds);
      const profileMap = {};
      if (profiles) profiles.forEach((p) => { profileMap[p.id] = p; });
      records = data.map((r) => ({ ...r, profile: r.profile || profileMap[r.user_id] || null }));
    }

    // Fetch emails
    const ids = records.map((r) => r.user_id);
    let emailMap = {};
    try {
      const res = await fetch('/api/admin/user-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: ids }),
      });
      if (res.ok) emailMap = await res.json();
    } catch { /* fallback */ }

    setRequests(records.map((r) => ({ ...r, email: emailMap[r.user_id] || 'N/A' })));
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const supabase = createClient();
    await supabase
      .from('clinician_help_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const updateNotes = async (id, notes) => {
    const supabase = createClient();
    await supabase
      .from('clinician_help_requests')
      .update({ admin_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', id);
  };

  const deleteRequest = async (id) => {
    const supabase = createClient();
    await supabase
      .from('clinician_help_requests')
      .delete()
      .eq('id', id);

    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  if (authLoading) return <p className="p-8 text-text-muted">Loading...</p>;
  if (!user || !isAdmin(user.id)) return <p className="p-8 text-text-muted">Not authorized.</p>;

  const filtered = filterStatus === 'all'
    ? requests
    : requests.filter((r) => r.status === filterStatus);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/analytics" className="text-xs text-purple hover:underline">&larr; Back to Analytics</Link>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-foreground">Looking for a Clinician</h1>
        <p className="mt-1 text-sm text-text-muted">{requests.length} total requests</p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className="rounded-lg border px-3 py-1.5 text-xs font-medium transition"
          style={{
            borderColor: filterStatus === 'all' ? 'var(--purple)' : 'var(--border-subtle)',
            background: filterStatus === 'all' ? 'var(--purple-pale)' : 'transparent',
            color: filterStatus === 'all' ? 'var(--purple)' : 'var(--text-muted)',
          }}
        >
          All ({requests.length})
        </button>
        {STATUSES.map((s) => {
          const count = requests.filter((r) => r.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition"
              style={{
                borderColor: filterStatus === s ? STATUS_COLORS[s] : 'var(--border-subtle)',
                background: filterStatus === s ? `${STATUS_COLORS[s]}20` : 'transparent',
                color: filterStatus === s ? STATUS_COLORS[s] : 'var(--text-muted)',
              }}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Requests list */}
      {loading ? (
        <p className="text-sm text-text-muted">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-text-muted">No requests found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="rounded-xl border p-4"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {req.profile?.avatar_url && (
                      <img src={req.profile.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                    )}
                    <p className="text-sm font-semibold text-foreground">
                      {req.profile?.display_name || 'Anonymous'}
                    </p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                      style={{ background: STATUS_COLORS[req.status] }}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">{req.email}</p>
                  {req.profile?.drug && (
                    <p className="mt-1.5 text-xs text-text-muted">
                      <span className="font-medium">Medication:</span> {req.profile.drug}
                      {req.profile.taper_stage ? ` — ${req.profile.taper_stage}` : ''}
                    </p>
                  )}
                  {req.profile?.drug_signature && (
                    <p className="mt-0.5 text-xs italic text-text-subtle">{req.profile.drug_signature}</p>
                  )}
                  <p className="mt-1 text-[10px] text-text-subtle">
                    Requested {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/profile/${req.user_id}`}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium text-purple no-underline transition hover:border-purple"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    Profile
                  </Link>
                  {/* Status dropdown */}
                  <select
                    value={req.status}
                    onChange={(e) => updateStatus(req.id, e.target.value)}
                    className="rounded-lg border px-2 py-1.5 text-xs"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {/* Delete */}
                  <button
                    onClick={() => { if (window.confirm('Delete this request?')) deleteRequest(req.id); }}
                    className="rounded-lg border px-2 py-1.5 text-xs text-rose-500 transition hover:border-rose-400 hover:bg-rose-50"
                    style={{ borderColor: 'var(--border-subtle)' }}
                    title="Delete request"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Admin notes */}
              <div className="mt-3">
                <textarea
                  defaultValue={req.admin_notes || ''}
                  onBlur={(e) => updateNotes(req.id, e.target.value)}
                  placeholder="Admin notes..."
                  rows={2}
                  className="w-full rounded-lg border px-3 py-2 text-xs"
                  style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
