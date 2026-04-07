'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/lib/blog';
import { useRouteCleanup } from '@/hooks/useRouteCleanup';

const STATUSES = ['pending', 'contacted', 'onboarded', 'matched', 'declined', 'closed'];
const STATUS_COLORS = {
  pending: '#E8A838',
  contacted: '#5B2E91',
  onboarded: '#3B82F6',
  matched: '#34A853',
  declined: '#D64545',
  closed: '#6B6580',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'flagged', label: 'Flagged first' },
  { value: 'manual', label: 'Manual order' },
];

/* ── location derivation ────────────────────────────── */

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota',
  'Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
  'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon',
  'Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah',
  'Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

const US_ABBR_TO_STATE = {
  'al':'Alabama','ak':'Alaska','az':'Arizona','ar':'Arkansas','ca':'California','co':'Colorado',
  'ct':'Connecticut','de':'Delaware','dc':'District of Columbia','fl':'Florida','ga':'Georgia',
  'hi':'Hawaii','id':'Idaho','il':'Illinois','in':'Indiana','ia':'Iowa','ks':'Kansas',
  'ky':'Kentucky','la':'Louisiana','me':'Maine','md':'Maryland','ma':'Massachusetts',
  'mi':'Michigan','mn':'Minnesota','ms':'Mississippi','mo':'Missouri','mt':'Montana',
  'ne':'Nebraska','nv':'Nevada','nh':'New Hampshire','nj':'New Jersey','nm':'New Mexico',
  'ny':'New York','nc':'North Carolina','nd':'North Dakota','oh':'Ohio','ok':'Oklahoma',
  'or':'Oregon','pa':'Pennsylvania','ri':'Rhode Island','sc':'South Carolina','sd':'South Dakota',
  'tn':'Tennessee','tx':'Texas','ut':'Utah','vt':'Vermont','va':'Virginia','wa':'Washington',
  'wv':'West Virginia','wi':'Wisconsin','wy':'Wyoming',
};

const CA_PROVINCES = [
  'Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador',
  'Nova Scotia','Ontario','Prince Edward Island','Quebec','Saskatchewan',
];
const CA_ABBR = { 'ab':'Alberta','bc':'British Columbia','mb':'Manitoba','nb':'New Brunswick',
  'nl':'Newfoundland and Labrador','ns':'Nova Scotia','on':'Ontario','pe':'Prince Edward Island',
  'qc':'Quebec','sk':'Saskatchewan' };

const COUNTRIES = ['Australia','United Kingdom','Ireland','Denmark','Norway','Sweden',
  'Netherlands','Germany','France','Italy','Poland','Spain','Portugal','Switzerland',
  'Austria','Belgium','Finland','Greece','Czech Republic','Romania','Hungary'];

function deriveRegion(req) {
  // Manual override takes priority
  if (req.assigned_location) return req.assigned_location;

  const loc = (req.profile?.location || '').trim();
  const ip = (req.profile?.ip_location || '').trim();

  if (!loc && !ip) return null;

  // ip_location format from Vercel: "City, StateCode, CountryCode" e.g. "Los Angeles, CA, US"
  const ipParts = ip.split(',').map(s => s.trim());
  const combined = `${loc}, ${ip}`.toLowerCase();

  // Detect country — check last part, or anywhere in text
  const lastPart = (ipParts[ipParts.length - 1] || '').toLowerCase();
  const isUS = lastPart === 'us' || lastPart === 'usa' || combined.includes('united states');
  const isCA = (!isUS && (lastPart === 'ca' || combined.includes('canada')));

  // For US: resolve to state
  if (isUS) {
    // Try every part of ip_location as a potential state abbreviation
    for (const part of ipParts) {
      const code = part.trim().toLowerCase();
      if (code !== 'us' && code !== 'usa' && US_ABBR_TO_STATE[code]) return US_ABBR_TO_STATE[code];
    }
    // Try full state names anywhere in combined text
    for (const st of US_STATES) {
      if (combined.includes(st.toLowerCase())) return st;
    }
    // Try state abbreviations with word boundary in the full text
    for (const [abbr, full] of Object.entries(US_ABBR_TO_STATE)) {
      const re = new RegExp(`\\b${abbr}\\b`, 'i');
      if (re.test(loc) || re.test(ip)) return full;
    }
    return 'USA (unspecified)';
  }

  // For Canada: resolve to province
  if (isCA) {
    for (const part of ipParts) {
      const code = part.trim().toLowerCase();
      if (code !== 'ca' && CA_ABBR[code]) return CA_ABBR[code];
    }
    for (const prov of CA_PROVINCES) {
      if (combined.includes(prov.toLowerCase())) return prov;
    }
    for (const [abbr, full] of Object.entries(CA_ABBR)) {
      const re = new RegExp(`\\b${abbr}\\b`, 'i');
      if (re.test(loc) || re.test(ip)) return full;
    }
    return 'Canada (unspecified)';
  }

  // For everyone else: resolve to country
  if (ipCountryCode === 'gb' || combined.includes('united kingdom') || combined.includes('england') || combined.includes(', uk')) return 'United Kingdom';
  if (ipCountryCode === 'ie' || combined.includes('ireland')) return 'Ireland';
  if (ipCountryCode === 'au' || combined.includes('australia')) return 'Australia';
  if (ipCountryCode === 'dk' || combined.includes('denmark')) return 'Denmark';
  if (ipCountryCode === 'no' || combined.includes('norway')) return 'Norway';
  if (ipCountryCode === 'se' || combined.includes('sweden')) return 'Sweden';
  if (ipCountryCode === 'nl' || combined.includes('netherlands')) return 'Netherlands';
  if (ipCountryCode === 'de' || combined.includes('germany')) return 'Germany';
  if (ipCountryCode === 'fr' || combined.includes('france')) return 'France';
  if (ipCountryCode === 'it' || combined.includes('italy')) return 'Italy';
  if (ipCountryCode === 'pl' || combined.includes('poland')) return 'Poland';
  if (ipCountryCode === 'es' || combined.includes('spain')) return 'Spain';
  if (ipCountryCode === 'pt' || combined.includes('portugal')) return 'Portugal';
  if (ipCountryCode === 'ch' || combined.includes('switzerland')) return 'Switzerland';
  if (ipCountryCode === 'at' || combined.includes('austria')) return 'Austria';
  if (ipCountryCode === 'be' || combined.includes('belgium')) return 'Belgium';
  if (ipCountryCode === 'fi' || combined.includes('finland')) return 'Finland';
  if (ipCountryCode === 'gr' || combined.includes('greece')) return 'Greece';
  if (ipCountryCode === 'cz' || combined.includes('czech')) return 'Czech Republic';
  if (ipCountryCode === 'ro' || combined.includes('romania')) return 'Romania';
  if (ipCountryCode === 'hu' || combined.includes('hungary')) return 'Hungary';
  if (ipCountryCode === 'nz' || combined.includes('new zealand')) return 'New Zealand';
  if (ipCountryCode === 'za' || combined.includes('south africa')) return 'South Africa';
  if (ipCountryCode === 'in' || combined.includes('india')) return 'India';

  // Fallback: try full state/province names in text
  for (const st of US_STATES) {
    if (combined.includes(st.toLowerCase())) return st;
  }
  for (const prov of CA_PROVINCES) {
    if (combined.includes(prov.toLowerCase())) return prov;
  }

  return ipCountryCode ? ipCountryCode.toUpperCase() : null;
}

/* ── helpers ─────────────────────────────────────────── */

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

/* ── shared styles ───────────────────────────────────── */

const inputClass = 'w-full rounded-lg border px-3 py-2 text-xs';
const inputStyle = { borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' };

/* ── profile search typeahead ────────────────────────── */

function ProfileSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q || q.length < 2) { setResults([]); setOpen(false); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, email, avatar_url')
      .or(`display_name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(8);
    if (data?.length) { setResults(data); setActiveIdx(0); setOpen(true); }
    else { setResults([]); setOpen(false); }
  }, []);

  const handleChange = (val) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 250);
  };

  const pick = (profile) => {
    onSelect(profile);
    setQuery('');
    setOpen(false);
    setResults([]);
  };

  const handleKeyDown = (e) => {
    if (!open || !results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => (i + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => (i - 1 + results.length) % results.length); }
    else if (e.key === 'Enter' || e.key === 'Tab') { if (results[activeIdx]) { e.preventDefault(); pick(results[activeIdx]); } }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text" value={query}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (results.length) setOpen(true); }}
        className={inputClass} style={inputStyle}
        placeholder="Type name or email to search..."
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border bg-white shadow-lg"
          style={{ borderColor: 'var(--border-subtle)' }}>
          {results.map((p, idx) => (
            <button key={p.id} type="button"
              onMouseDown={e => { e.preventDefault(); pick(p); }}
              onMouseEnter={() => setActiveIdx(idx)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition"
              style={{ background: idx === activeIdx ? 'var(--purple-ghost)' : 'transparent', color: 'var(--foreground)' }}>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: 'var(--purple)' }}>
                {(p.display_name || '?')[0].toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{p.display_name}</span>
                {p.email && <span className="block truncate text-[10px] text-text-muted">{p.email}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── main component ──────────────────────────────────── */

export default function MatchRequestsAdmin() {
  useRouteCleanup();
  const { user, loading: authLoading } = useAuth();

  // data
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [, setTick] = useState(0);

  // filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addStatus, setAddStatus] = useState('pending');
  const [addUserId, setAddUserId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // card actions
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notesSaving, setNotesSaving] = useState(null);
  const [notesSaved, setNotesSaved] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationSaving, setLocationSaving] = useState(null);

  const isFirstLoad = useRef(true);
  const intervalRef = useRef(null);

  /* ── fetch requests ─────────────────────────────── */

  const fetchRequests = useCallback(async () => {
    if (isFirstLoad.current) setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('match_requests')
        .select('*, clinician:clinicians(name, role), profile:profiles(display_name, avatar_url, location, ip_location)')
        .order('created_at', { ascending: false });

      if (error) { console.error('[match-requests] fetch error:', error); return; }
      setRequests(data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[match-requests] fetch error:', err);
    } finally {
      if (isFirstLoad.current) {
        setLoading(false);
        isFirstLoad.current = false;
      }
    }
  }, []);

  useEffect(() => {
    if (!user || !isAdmin(user.id)) return;
    fetchRequests();
    intervalRef.current = setInterval(fetchRequests, 30000);
    return () => clearInterval(intervalRef.current);
  }, [user, fetchRequests]);

  // tick for timeAgo
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 10000);
    return () => clearInterval(t);
  }, []);

  /* ── CRUD handlers ──────────────────────────────── */

  const handleAdd = async () => {
    if (!addName.trim()) {
      setSaveError('Name is required');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/admin/match-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: addName.trim(),
          patient_email: addEmail.trim() || 'N/A',
          user_id: addUserId || null,
          status: addStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create');
      setAddName('');
      setAddEmail('');
      setAddStatus('pending');
      setAddUserId(null);
      setShowAddForm(false);
      // Re-fetch to get properly joined data
      await fetchRequests();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch('/api/admin/match-requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      setRequests(prev => prev.filter(r => r.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    try {
      const res = await fetch('/api/admin/match-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) { console.error('[match-requests] status update failed'); await fetchRequests(); }
    } catch (err) {
      console.error('[match-requests] status update error:', err);
      await fetchRequests();
    }
  };

  const toggleFlag = async (id, flagged) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, flagged } : r));
    try {
      const res = await fetch('/api/admin/match-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, flagged }),
      });
      if (!res.ok) { console.error('[match-requests] flag update failed'); await fetchRequests(); }
    } catch (err) {
      console.error('[match-requests] flag update error:', err);
      await fetchRequests();
    }
  };

  const saveNotes = async (id, notes) => {
    setNotesSaving(id);
    try {
      const res = await fetch('/api/admin/match-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, admin_notes: notes }),
      });
      if (!res.ok) console.error('[match-requests] notes save failed');
    } catch (err) {
      console.error('[match-requests] notes save error:', err);
    }
    setNotesSaving(null);
    setNotesSaved(id);
    setTimeout(() => setNotesSaved(prev => prev === id ? null : prev), 2000);
  };

  const saveLocation = async (id, location) => {
    setLocationSaving(id);
    const trimmed = location.trim() || null;
    setRequests(prev => prev.map(r => r.id === id ? { ...r, assigned_location: trimmed } : r));
    try {
      const res = await fetch('/api/admin/match-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, assigned_location: trimmed }),
      });
      if (!res.ok) console.error('[match-requests] location save failed');
    } catch (err) {
      console.error('[match-requests] location save error:', err);
    }
    setLocationSaving(null);
    setEditingLocation(null);
  };

  const moveEntry = async (currentIdx, direction) => {
    const swapIdx = currentIdx + direction;
    if (swapIdx < 0 || swapIdx >= filtered.length) return;

    const itemA = filtered[currentIdx];
    const itemB = filtered[swapIdx];

    // Assign new sort_order values based on visual position
    const newOrderA = swapIdx;
    const newOrderB = currentIdx;

    // Update all filtered items with sequential sort_order, then swap the two
    const newOrders = {};
    filtered.forEach((r, i) => { newOrders[r.id] = i; });
    newOrders[itemA.id] = newOrderA;
    newOrders[itemB.id] = newOrderB;

    setRequests(prev => prev.map(r =>
      newOrders[r.id] != null ? { ...r, sort_order: newOrders[r.id] } : r
    ));

    // Auto-switch to manual sort so user sees the result
    if (sortBy !== 'manual') setSortBy('manual');

    const supabase = createClient();
    await Promise.all([
      supabase.from('match_requests').update({ sort_order: newOrderA }).eq('id', itemA.id),
      supabase.from('match_requests').update({ sort_order: newOrderB }).eq('id', itemB.id),
    ]);
  };

  /* ── filtering & sorting ────────────────────────── */

  // derive regions for all requests
  const requestsWithRegion = requests.map(r => ({ ...r, _region: deriveRegion(r) }));
  const allLocations = [...new Set(requestsWithRegion.map(r => r._region).filter(Boolean))].sort();

  const filtered = requestsWithRegion
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .filter(r => {
      if (filterLocation === 'all') return true;
      if (filterLocation === 'unknown') return !r._region;
      return r._region === filterLocation;
    })
    .filter(r => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return [r.patient_name, r.patient_email, r.medications, r.notes, r.admin_notes, r._region]
        .some(f => f?.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'name') return (a.patient_name || '').localeCompare(b.patient_name || '');
      if (sortBy === 'updated') return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
      if (sortBy === 'flagged') return (b.flagged ? 1 : 0) - (a.flagged ? 1 : 0) || new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'manual') return (a.sort_order ?? 9999) - (b.sort_order ?? 9999);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  /* ── auth guard ─────────────────────────────────── */

  if (authLoading) return <p className="p-8 text-text-muted">Loading...</p>;
  if (!user || !isAdmin(user.id)) return <p className="p-8 text-text-muted">Not authorized.</p>;

  /* ── render ─────────────────────────────────────── */

  return (
    <div className="space-y-5">

      {/* ── header ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl font-semibold text-foreground">Match Requests</h1>
          <p className="mt-0.5 text-xs text-text-muted">
            {requests.length} total{lastUpdated && <> &middot; updated {timeAgo(lastUpdated)}</>}
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          &#x21bb; Refresh
        </button>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setSaveError(null); }}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
          style={{ background: 'var(--purple)' }}
        >
          {showAddForm ? 'Cancel' : '+ Add Entry'}
        </button>
      </div>

      {/* ── add form (simplified) ───────────────────── */}
      {showAddForm && (
        <div
          className="rounded-xl border p-5"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
        >
          <h2 className="mb-3 text-sm font-semibold text-foreground">Add New Entry</h2>

          {/* profile search */}
          <div className="mb-3">
            <span className="mb-1 block text-[11px] font-medium text-text-muted">Search Community Member</span>
            <ProfileSearch
              onSelect={(profile) => {
                setAddName(profile.display_name || '');
                setAddEmail(profile.email || '');
                setAddUserId(profile.id);
              }}
            />
            {addUserId && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[11px] font-medium" style={{ color: 'var(--purple)' }}>
                  Linked: {addName}
                </span>
                <button onClick={() => { setAddUserId(null); setAddName(''); setAddEmail(''); }}
                  className="text-[10px] font-medium hover:underline" style={{ color: '#D64545' }}>
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* name + email + status */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <span className="mb-1 block text-[11px] font-medium text-text-muted">Name *</span>
              <input
                type="text" value={addName}
                onChange={e => setAddName(e.target.value)}
                className={inputClass} style={inputStyle} placeholder="Full name"
              />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-medium text-text-muted">Email</span>
              <input
                type="email" value={addEmail}
                onChange={e => setAddEmail(e.target.value)}
                className={inputClass} style={inputStyle} placeholder="email@example.com (optional)"
              />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-medium text-text-muted">Status</span>
              <select
                value={addStatus} onChange={e => setAddStatus(e.target.value)}
                className={inputClass} style={inputStyle}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {saveError && <p className="mt-2 text-xs text-red-500">{saveError}</p>}
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAdd} disabled={saving}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--purple)' }}
            >
              {saving ? 'Saving...' : 'Add Entry'}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setAddName(''); setAddEmail(''); setAddStatus('pending'); setAddUserId(null); setSaveError(null); }}
              className="rounded-lg border px-4 py-2 text-xs font-medium transition hover:opacity-80"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── search + sort + location ─────────────────── */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text" value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search name, email, meds, notes..."
          className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
        />
        <select
          value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="rounded-lg border px-2 py-2 text-xs"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={filterLocation} onChange={e => setFilterLocation(e.target.value)}
          className="rounded-lg border px-2 py-2 text-xs"
          style={{ borderColor: filterLocation !== 'all' ? 'var(--purple)' : 'var(--border-subtle)', color: filterLocation !== 'all' ? 'var(--purple)' : undefined }}
        >
          <option value="all">All locations ({requestsWithRegion.length})</option>
          {allLocations.map(loc => {
            const count = requestsWithRegion.filter(r => r._region === loc).length;
            return <option key={loc} value={loc}>{loc} ({count})</option>;
          })}
          <option value="unknown">Unknown ({requestsWithRegion.filter(r => !r._region).length})</option>
        </select>
      </div>

      {/* ── status filters ──────────────────────────── */}
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
        {STATUSES.map(s => {
          const count = requests.filter(r => r.status === s).length;
          return (
            <button
              key={s} onClick={() => setFilterStatus(s)}
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

      {/* ── results count ───────────────────────────── */}
      <p className="text-[11px] text-text-subtle">
        Showing {filtered.length} of {requests.length} requests
        {filterLocation !== 'all' && <> in <strong>{filterLocation === 'unknown' ? 'unknown location' : filterLocation}</strong></>}
        {searchQuery && <> matching &ldquo;{searchQuery}&rdquo;</>}
      </p>

      {/* ── requests list ───────────────────────────── */}
      {loading ? (
        <p className="text-sm text-text-muted">Loading requests...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-text-muted">No requests found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((req, idx) => (
            <div
              key={req.id}
              className="rounded-xl border p-4"
              style={{
                borderColor: req.flagged ? '#E8A838' : 'var(--border-subtle)',
                background: req.flagged ? '#FFF8EE' : 'var(--surface-strong)',
                borderLeft: `4px solid ${STATUS_COLORS[req.status] || 'var(--border-subtle)'}`,
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{req.patient_name}</p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                      style={{ background: STATUS_COLORS[req.status] }}
                    >
                      {req.status}
                    </span>
                    {req.flagged && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: '#E8A83830', color: '#E8A838' }}>
                        Needs Help
                      </span>
                    )}
                    {req.user_id && (
                      <Link
                        href={`/profile/${req.user_id}`}
                        className="rounded-md border px-1.5 py-0.5 text-[10px] font-medium no-underline transition hover:opacity-80"
                        style={{ borderColor: 'var(--purple)', color: 'var(--purple)' }}
                      >
                        {req.profile?.display_name || 'View Profile'}
                      </Link>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">{req.patient_email}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                    {editingLocation === req.id ? (
                      <span className="inline-flex items-center gap-1">
                        <select
                          defaultValue={req.assigned_location || req._region || ''}
                          id={`loc-select-${req.id}`}
                          className="rounded-md border px-1.5 py-1 text-[11px]"
                          style={{ borderColor: 'var(--purple)', background: 'var(--purple-ghost)', maxWidth: 180 }}
                        >
                          <option value="">— Clear —</option>
                          <optgroup label="US States">
                            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </optgroup>
                          <optgroup label="Canadian Provinces">
                            {CA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                          </optgroup>
                          <optgroup label="Countries">
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </optgroup>
                        </select>
                        <button
                          onClick={() => {
                            const val = document.getElementById(`loc-select-${req.id}`)?.value;
                            saveLocation(req.id, val || '');
                          }}
                          disabled={locationSaving === req.id}
                          className="rounded-md px-2 py-1 text-[10px] font-semibold text-white"
                          style={{ background: 'var(--purple)' }}
                        >
                          {locationSaving === req.id ? '...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingLocation(null)}
                          className="text-[10px] text-text-subtle hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <>
                        {req._region ? (
                          <span
                            className="cursor-pointer rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition hover:opacity-80"
                            style={{
                              borderColor: req.assigned_location ? '#34A853' : 'var(--purple)',
                              color: req.assigned_location ? '#34A853' : 'var(--purple)',
                              background: req.assigned_location ? '#34A85310' : 'var(--purple-pale)',
                            }}
                            onClick={() => setEditingLocation(req.id)}
                            title="Click to change location"
                          >
                            {req._region}{req.assigned_location ? ' (manual)' : ''}
                          </span>
                        ) : (
                          <button
                            onClick={() => setEditingLocation(req.id)}
                            className="rounded-md border border-dashed px-1.5 py-0.5 text-[10px] font-medium text-text-subtle transition hover:border-purple hover:text-purple"
                            style={{ borderColor: 'var(--border-subtle)' }}
                          >
                            + Assign Location
                          </button>
                        )}
                        {req.profile?.location && <span>{req.profile.location}</span>}
                        {req.profile?.ip_location && <span className="text-text-subtle">IP: {req.profile.ip_location}</span>}
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-text-subtle">
                    &rarr; {req.clinician_id
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
                      {req.support_types.map(t => (
                        <span key={t} className="rounded-md border px-1.5 py-0.5 text-[10px] text-text-subtle"
                          style={{ borderColor: 'var(--border-subtle)' }}>{t}</span>
                      ))}
                    </div>
                  )}
                  {req.notes && (
                    <p className="mt-1 text-xs text-text-subtle italic">&ldquo;{req.notes}&rdquo;</p>
                  )}
                  <p className="mt-1 text-[10px] text-text-subtle">
                    Created {formatDate(req.created_at)}
                    {req.updated_at && req.updated_at !== req.created_at && (
                      <> &middot; Updated {formatDate(req.updated_at)}</>
                    )}
                  </p>
                </div>

                {/* ── actions ────────────────── */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveEntry(idx, -1)} disabled={idx === 0}
                      className="rounded border px-1.5 py-0.5 text-[10px] leading-none transition hover:opacity-80 disabled:opacity-30"
                      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }} title="Move up">
                      &#9650;
                    </button>
                    <button onClick={() => moveEntry(idx, 1)} disabled={idx === filtered.length - 1}
                      className="rounded border px-1.5 py-0.5 text-[10px] leading-none transition hover:opacity-80 disabled:opacity-30"
                      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }} title="Move down">
                      &#9660;
                    </button>
                  </div>
                  <button
                    onClick={() => toggleFlag(req.id, !req.flagged)}
                    className="rounded-lg border px-2 py-1.5 text-xs font-medium transition hover:opacity-80"
                    style={{
                      borderColor: req.flagged ? '#E8A838' : 'var(--border-subtle)',
                      color: req.flagged ? '#E8A838' : 'var(--text-muted)',
                      background: req.flagged ? '#E8A83815' : 'transparent',
                    }}
                    title={req.flagged ? 'Remove flag' : 'Flag as needs help'}
                  >
                    {req.flagged ? 'Unflag' : 'Flag'}
                  </button>
                  <select
                    value={req.status}
                    onChange={e => updateStatus(req.id, e.target.value)}
                    className="rounded-lg border px-2 py-1.5 text-xs"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {deleteConfirm === req.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="rounded-lg px-2 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                        style={{ background: '#D64545' }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-1 text-xs text-text-muted hover:underline"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(req.id)}
                      className="rounded-lg border px-2 py-1.5 text-xs font-medium transition hover:opacity-80"
                      style={{ borderColor: 'var(--border-subtle)', color: '#D64545' }}
                      title="Delete"
                    >
                      Del
                    </button>
                  )}
                </div>
              </div>

              {/* ── admin notes with save button ── */}
              <div className="mt-3">
                <div className="flex items-end gap-2">
                  <textarea
                    id={`notes-${req.id}`}
                    defaultValue={req.admin_notes || ''}
                    placeholder="Admin notes..."
                    rows={2}
                    className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-xs"
                    style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById(`notes-${req.id}`);
                      if (el) saveNotes(req.id, el.value);
                    }}
                    disabled={notesSaving === req.id}
                    className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    style={{ background: notesSaved === req.id ? '#34A853' : 'var(--purple)' }}
                  >
                    {notesSaving === req.id ? 'Saving...' : notesSaved === req.id ? 'Saved!' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
