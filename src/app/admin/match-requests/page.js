'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/lib/blog';

const STATUSES = ['pending', 'contacted', 'matched', 'declined', 'closed'];
const STATUS_COLORS = {
  pending: '#E8A838',
  contacted: '#5B2E91',
  matched: '#34A853',
  declined: '#D64545',
  closed: '#6B6580',
};

export default function MatchRequestsAdmin() {
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
    const { data } = await supabase
      .from('match_requests')
      .select('*, clinician:clinicians(name, role)')
      .order('created_at', { ascending: false });

    setRequests(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const supabase = createClient();
    await supabase
      .from('match_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const updateNotes = async (id, notes) => {
    const supabase = createClient();
    await supabase
      .from('match_requests')
      .update({ admin_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', id);
  };

  if (authLoading) return <p className="p-8 text-text-muted">Loading...</p>;
  if (!user || !isAdmin(user.id)) return <p className="p-8 text-text-muted">Not authorized.</p>;

  const filtered = filterStatus === 'all'
    ? requests
    : requests.filter((r) => r.status === filterStatus);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Match Requests</h1>
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
        <p className="text-sm text-text-muted">Loading requests...</p>
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
                    <p className="text-sm font-semibold text-foreground">{req.patient_name}</p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                      style={{ background: STATUS_COLORS[req.status] }}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">{req.patient_email}</p>
                  <p className="mt-1 text-xs text-text-subtle">
                    → {req.clinician_id
                      ? `${req.clinician?.name || 'Unknown clinician'}${req.clinician?.role ? ` (${req.clinician.role})` : ''}`
                      : 'General request — needs clinician match'}
                  </p>
                  {req.medications && (
                    <p className="mt-1 text-xs text-text-muted">
                      <span className="font-medium">Meds:</span> {req.medications}
                    </p>
                  )}
                  {req.taper_duration && (
                    <p className="text-xs text-text-muted">
                      <span className="font-medium">Duration:</span> {req.taper_duration}
                    </p>
                  )}
                  {req.support_types?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {req.support_types.map((t) => (
                        <span key={t} className="rounded-md border px-1.5 py-0.5 text-[10px] text-text-subtle" style={{ borderColor: 'var(--border-subtle)' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {req.notes && (
                    <p className="mt-1 text-xs text-text-subtle italic">&ldquo;{req.notes}&rdquo;</p>
                  )}
                  <p className="mt-1 text-[10px] text-text-subtle">
                    {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>

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
