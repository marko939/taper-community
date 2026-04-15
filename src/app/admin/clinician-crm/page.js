'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/lib/blog';
import { useRouteCleanup } from '@/hooks/useRouteCleanup';

const STATUSES = ['new', 'contacted', 'responded', 'onboarded', 'declined', 'inactive'];
const STATUS_COLORS = {
  new: '#E8A838',
  contacted: '#5B2E91',
  responded: '#3B82F6',
  onboarded: '#34A853',
  declined: '#D64545',
  inactive: '#6B6580',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'flagged', label: 'Flagged first' },
  { value: 'state', label: 'State A-Z' },
  { value: 'manual', label: 'Manual order' },
];

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

const US_STATES = new Set([
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota',
  'Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
  'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon',
  'Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah',
  'Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming',
]);

const CA_PROVINCES = new Set([
  'Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador',
  'Nova Scotia','Ontario','Prince Edward Island','Quebec','Saskatchewan',
  'Northwest Territories','Nunavut','Yukon',
]);

const CA_ABBR_TO_PROVINCE = {
  'ab': 'Alberta', 'bc': 'British Columbia', 'mb': 'Manitoba', 'nb': 'New Brunswick',
  'nl': 'Newfoundland and Labrador', 'ns': 'Nova Scotia', 'on': 'Ontario',
  'pe': 'Prince Edward Island', 'qc': 'Quebec', 'sk': 'Saskatchewan',
  'nt': 'Northwest Territories', 'nu': 'Nunavut', 'yt': 'Yukon',
};

/** Extract Canadian province from state field or address text */
function deriveProvince(entry) {
  // Check state field first
  if (entry.state && CA_PROVINCES.has(entry.state)) return entry.state;
  // Check abbreviations in state field (e.g. "BC", "ON")
  const stLower = (entry.state || '').toLowerCase().trim();
  if (CA_ABBR_TO_PROVINCE[stLower]) return CA_ABBR_TO_PROVINCE[stLower];
  // Parse province from address (e.g. "Edmonton, Alberta, Canada" or "Vancouver, BC, Canada")
  const addr = entry.address || '';
  for (const prov of CA_PROVINCES) {
    if (addr.includes(prov)) return prov;
  }
  for (const [abbr, prov] of Object.entries(CA_ABBR_TO_PROVINCE)) {
    // Match ", BC," or ", BC " or ending with ", BC"
    const re = new RegExp(`[,\\s]${abbr.toUpperCase()}[,\\s]|[,\\s]${abbr.toUpperCase()}$`);
    if (re.test(addr)) return prov;
  }
  return null;
}

function deriveCountry(entry) {
  const addr = (entry.address || '').toLowerCase();
  if (addr.includes('canada') || CA_PROVINCES.has(entry.state) || CA_ABBR_TO_PROVINCE[(entry.state || '').toLowerCase().trim()]) return 'Canada';
  if (addr.includes('united kingdom') || addr.includes('england') || addr.includes(', uk')) return 'United Kingdom';
  if (addr.includes('australia')) return 'Australia';
  if (addr.includes('denmark')) return 'Denmark';
  if (addr.includes('norway')) return 'Norway';
  if (addr.includes('italy')) return 'Italy';
  if (addr.includes('ireland')) return 'Ireland';
  if (addr.includes('poland')) return 'Poland';
  if (addr.includes('france')) return 'France';
  if (addr.includes('germany')) return 'Germany';
  if (addr.includes('netherlands')) return 'Netherlands';
  if (addr.includes('new zealand')) return 'New Zealand';
  if (addr.includes('sweden')) return 'Sweden';
  if (entry.state && US_STATES.has(entry.state)) return 'USA';
  if (entry.state === 'Multi-State') return 'USA';
  if (entry.state) return 'USA'; // default entries with an unrecognized state to USA
  return 'Other';
}

const inputClass = 'w-full rounded-lg border px-3 py-2 text-xs';
const inputStyle = { borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' };

export default function ClinicianCrmAdmin() {
  useRouteCleanup();
  const { user, loading: authLoading } = useAuth();

  // data
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [, setTick] = useState(0);

  // filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState('');
  const [addCredentials, setAddCredentials] = useState('');
  const [addClinic, setAddClinic] = useState('');
  const [addState, setAddState] = useState('');
  const [addAddress, setAddAddress] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // card actions
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notesSaving, setNotesSaving] = useState(null);
  const [notesSaved, setNotesSaved] = useState(null);

  const isFirstLoad = useRef(true);
  const intervalRef = useRef(null);

  const fetchEntries = useCallback(async () => {
    if (isFirstLoad.current) setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('clinician_crm')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) { console.error('[clinician-crm] fetch error:', error); return; }
      setEntries(data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[clinician-crm] fetch error:', err);
    } finally {
      if (isFirstLoad.current) {
        setLoading(false);
        isFirstLoad.current = false;
      }
    }
  }, []);

  useEffect(() => {
    if (!user || !isAdmin(user.id)) return;
    fetchEntries();
    intervalRef.current = setInterval(fetchEntries, 30000);
    return () => clearInterval(intervalRef.current);
  }, [user, fetchEntries]);

  // tick for timeAgo
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 10000);
    return () => clearInterval(t);
  }, []);

  const handleAdd = async () => {
    if (!addName.trim()) {
      setSaveError('Name is required');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/admin/clinician-crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addName.trim(),
          credentials: addCredentials.trim() || null,
          clinic: addClinic.trim() || null,
          state: addState.trim() || null,
          address: addAddress.trim() || null,
          phone: addPhone.trim() || null,
          email_website: addEmail.trim() || null,
          description: addDescription.trim() || null,
          status: 'new',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create');
      setAddName(''); setAddCredentials(''); setAddClinic('');
      setAddState(''); setAddAddress(''); setAddPhone('');
      setAddEmail(''); setAddDescription('');
      setShowAddForm(false);
      await fetchEntries();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch('/api/admin/clinician-crm', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      setEntries(prev => prev.filter(r => r.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    setEntries(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    try {
      const res = await fetch('/api/admin/clinician-crm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) { console.error('[clinician-crm] status update failed'); await fetchEntries(); }
    } catch (err) {
      console.error('[clinician-crm] status update error:', err);
      await fetchEntries();
    }
  };

  const toggleFlag = async (id, flagged) => {
    setEntries(prev => prev.map(r => r.id === id ? { ...r, flagged } : r));
    try {
      const res = await fetch('/api/admin/clinician-crm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, flagged }),
      });
      if (!res.ok) { console.error('[clinician-crm] flag update failed'); await fetchEntries(); }
    } catch (err) {
      console.error('[clinician-crm] flag update error:', err);
      await fetchEntries();
    }
  };

  const saveNotes = async (id, notes) => {
    setNotesSaving(id);
    try {
      const res = await fetch('/api/admin/clinician-crm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, admin_notes: notes }),
      });
      if (!res.ok) console.error('[clinician-crm] notes save failed');
    } catch (err) {
      console.error('[clinician-crm] notes save error:', err);
    }
    setNotesSaving(null);
    setNotesSaved(id);
    setTimeout(() => setNotesSaved(prev => prev === id ? null : prev), 2000);
  };

  const moveEntry = async (currentIdx, direction) => {
    const swapIdx = currentIdx + direction;
    if (swapIdx < 0 || swapIdx >= filtered.length) return;

    const itemA = filtered[currentIdx];
    const itemB = filtered[swapIdx];
    const newOrderA = swapIdx;
    const newOrderB = currentIdx;

    const newOrders = {};
    filtered.forEach((r, i) => { newOrders[r.id] = i; });
    newOrders[itemA.id] = newOrderA;
    newOrders[itemB.id] = newOrderB;

    setEntries(prev => prev.map(r =>
      newOrders[r.id] != null ? { ...r, sort_order: newOrders[r.id] } : r
    ));

    if (sortBy !== 'manual') setSortBy('manual');

    const supabase = createClient();
    await Promise.all([
      supabase.from('clinician_crm').update({ sort_order: newOrderA }).eq('id', itemA.id),
      supabase.from('clinician_crm').update({ sort_order: newOrderB }).eq('id', itemB.id),
    ]);
  };

  // derive countries and regions
  const entriesWithCountry = entries.map(e => {
    const _country = deriveCountry(e);
    // For Canada, derive province from address if state is missing
    const _region = _country === 'Canada' ? (deriveProvince(e) || e.state) : e.state;
    return { ...e, _country, _region };
  });
  const allCountries = [...new Set(entriesWithCountry.map(e => e._country))].sort();
  const allRegions = filterCountry !== 'all'
    ? [...new Set(entriesWithCountry.filter(e => e._country === filterCountry).map(e => e._region).filter(Boolean))].sort()
    : [];

  const filtered = entriesWithCountry
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .filter(r => filterCountry === 'all' || r._country === filterCountry)
    .filter(r => filterRegion === 'all' || r._region === filterRegion)
    .filter(r => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return [r.name, r.clinic, r.state, r.address, r.phone, r.email_website, r.description, r.admin_notes, r.credentials]
        .some(f => f?.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'updated') return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
      if (sortBy === 'flagged') return (b.flagged ? 1 : 0) - (a.flagged ? 1 : 0) || new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'state') return (a.state || 'ZZZ').localeCompare(b.state || 'ZZZ') || (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'manual') return (a.sort_order ?? 9999) - (b.sort_order ?? 9999);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  if (authLoading) return <p className="p-8 text-text-muted">Loading...</p>;
  if (!user || !isAdmin(user.id)) return <p className="p-8 text-text-muted">Not authorized.</p>;

  return (
    <div className="space-y-5">

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl font-semibold text-foreground">Clinician CRM</h1>
          <p className="mt-0.5 text-xs text-text-muted">
            {entries.length} total{lastUpdated && <> &middot; updated {timeAgo(lastUpdated)}</>}
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="rounded-lg border px-3 py-1.5 text-xs font-medium no-underline transition hover:opacity-80"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          &larr; Analytics
        </Link>
        <button
          onClick={fetchEntries}
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

      {showAddForm && (
        <div
          className="rounded-xl border p-5"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
        >
          <h2 className="mb-3 text-sm font-semibold text-foreground">Add New Clinician</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-[11px] font-medium text-text-muted">Name *</span>
              <input type="text" value={addName} onChange={e => setAddName(e.target.value)}
                className={inputClass} style={inputStyle} placeholder="Full name" />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-medium text-text-muted">Credentials</span>
              <input type="text" value={addCredentials} onChange={e => setAddCredentials(e.target.value)}
                className={inputClass} style={inputStyle} placeholder="e.g. PMHNP, MD, DNP" />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-medium text-text-muted">Clinic / Practice</span>
              <input type="text" value={addClinic} onChange={e => setAddClinic(e.target.value)}
                className={inputClass} style={inputStyle} placeholder="Clinic name" />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-medium text-text-muted">State</span>
              <input type="text" value={addState} onChange={e => setAddState(e.target.value)}
                className={inputClass} style={inputStyle} placeholder="e.g. California" />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-medium text-text-muted">Address</span>
              <input type="text" value={addAddress} onChange={e => setAddAddress(e.target.value)}
                className={inputClass} style={inputStyle} placeholder="Full address" />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-medium text-text-muted">Phone</span>
              <input type="text" value={addPhone} onChange={e => setAddPhone(e.target.value)}
                className={inputClass} style={inputStyle} placeholder="Phone number" />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-medium text-text-muted">Email / Website</span>
              <input type="text" value={addEmail} onChange={e => setAddEmail(e.target.value)}
                className={inputClass} style={inputStyle} placeholder="email or website URL" />
            </div>
          </div>

          <div className="mt-3">
            <span className="mb-1 block text-[11px] font-medium text-text-muted">Description / Evidence</span>
            <textarea value={addDescription} onChange={e => setAddDescription(e.target.value)}
              rows={2} className={inputClass} style={inputStyle}
              placeholder="Evidence of deprescribing, services offered..." />
          </div>

          {saveError && <p className="mt-2 text-xs text-red-500">{saveError}</p>}
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAdd} disabled={saving}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--purple)' }}
            >
              {saving ? 'Saving...' : 'Add Clinician'}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setAddName(''); setAddCredentials(''); setAddClinic(''); setAddState(''); setAddAddress(''); setAddPhone(''); setAddEmail(''); setAddDescription(''); setSaveError(null); }}
              className="rounded-lg border px-4 py-2 text-xs font-medium transition hover:opacity-80"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          type="text" value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search name, clinic, state, phone, notes..."
          className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}
        />
        <select
          value={filterCountry} onChange={e => { setFilterCountry(e.target.value); setFilterRegion('all'); }}
          className="rounded-lg border px-2 py-2 text-xs"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <option value="all">All countries</option>
          {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {allRegions.length > 1 && (
          <select
            value={filterRegion} onChange={e => setFilterRegion(e.target.value)}
            className="rounded-lg border px-2 py-2 text-xs"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <option value="all">{filterCountry === 'USA' ? 'All states' : filterCountry === 'Canada' ? 'All provinces' : 'All regions'}</option>
            {allRegions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <select
          value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="rounded-lg border px-2 py-2 text-xs"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

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
          All ({entries.length})
        </button>
        {STATUSES.map(s => {
          const count = entries.filter(r => r.status === s).length;
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

      <p className="text-[11px] text-text-subtle">
        Showing {filtered.length} of {entries.length} clinicians
        {searchQuery && <> matching &ldquo;{searchQuery}&rdquo;</>}
        {filterCountry !== 'all' && <> in {filterCountry}</>}
        {filterRegion !== 'all' && <>, {filterRegion}</>}
      </p>

      {loading ? (
        <p className="text-sm text-text-muted">Loading clinicians...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-text-muted">No clinicians found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry, idx) => (
            <div
              key={entry.id}
              className="rounded-xl border p-4"
              style={{
                borderColor: entry.flagged ? '#E8A838' : 'var(--border-subtle)',
                background: entry.flagged ? '#FFF8EE' : 'var(--surface-strong)',
                borderLeft: `4px solid ${STATUS_COLORS[entry.status] || 'var(--border-subtle)'}`,
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{entry.name}</p>
                    {entry.credentials && (
                      <span className="rounded-md border px-1.5 py-0.5 text-[10px] font-medium"
                        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                        {entry.credentials}
                      </span>
                    )}
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                      style={{ background: STATUS_COLORS[entry.status] }}
                    >
                      {entry.status}
                    </span>
                    {entry.flagged && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: '#E8A83830', color: '#E8A838' }}>
                        Priority
                      </span>
                    )}
                  </div>
                  {entry.clinic && (
                    <p className="mt-0.5 text-xs text-text-muted">{entry.clinic}</p>
                  )}
                  {(entry.state || entry.address) && (
                    <p className="mt-0.5 text-xs text-text-muted">
                      {entry.state && <span className="font-medium">{entry.state}</span>}
                      {entry.state && entry.address && <span className="mx-1">&middot;</span>}
                      {entry.address && <span>{entry.address}</span>}
                    </p>
                  )}
                  {(entry.phone || entry.email_website) && (
                    <p className="mt-0.5 text-xs text-text-muted">
                      {entry.phone && <span>{entry.phone}</span>}
                      {entry.phone && entry.email_website && <span className="mx-1">&middot;</span>}
                      {entry.email_website && (
                        entry.email_website.includes('.') && !entry.email_website.includes('@')
                          ? <a href={entry.email_website.startsWith('http') ? entry.email_website : `https://${entry.email_website}`} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium no-underline transition hover:opacity-80"
                              style={{ borderColor: 'var(--purple)', color: 'var(--purple)' }}>
                              Visit Site &#x2197;
                            </a>
                          : <span>{entry.email_website}</span>
                      )}
                    </p>
                  )}
                  {(entry.category || entry.practice_type) && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {entry.category && (
                        <span className="rounded-md border px-1.5 py-0.5 text-[10px] text-text-subtle"
                          style={{ borderColor: 'var(--border-subtle)' }}>{entry.category}</span>
                      )}
                      {entry.practice_type && (
                        <span className="rounded-md border px-1.5 py-0.5 text-[10px] text-text-subtle"
                          style={{ borderColor: 'var(--border-subtle)' }}>{entry.practice_type}</span>
                      )}
                    </div>
                  )}
                  {entry.description && (
                    <p className="mt-1 text-xs text-text-subtle line-clamp-2">{entry.description}</p>
                  )}
                  <p className="mt-1 text-[10px] text-text-subtle">
                    Created {formatDate(entry.created_at)}
                    {entry.updated_at && entry.updated_at !== entry.created_at && (
                      <> &middot; Updated {formatDate(entry.updated_at)}</>
                    )}
                    {entry.source && <> &middot; Source: {entry.source}</>}
                  </p>
                </div>

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
                    onClick={() => toggleFlag(entry.id, !entry.flagged)}
                    className="rounded-lg border px-2 py-1.5 text-xs font-medium transition hover:opacity-80"
                    style={{
                      borderColor: entry.flagged ? '#E8A838' : 'var(--border-subtle)',
                      color: entry.flagged ? '#E8A838' : 'var(--text-muted)',
                      background: entry.flagged ? '#E8A83815' : 'transparent',
                    }}
                    title={entry.flagged ? 'Remove flag' : 'Flag as priority'}
                  >
                    {entry.flagged ? 'Unflag' : 'Flag'}
                  </button>
                  <select
                    value={entry.status}
                    onChange={e => updateStatus(entry.id, e.target.value)}
                    className="rounded-lg border px-2 py-1.5 text-xs"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {deleteConfirm === entry.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(entry.id)}
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
                      onClick={() => setDeleteConfirm(entry.id)}
                      className="rounded-lg border px-2 py-1.5 text-xs font-medium transition hover:opacity-80"
                      style={{ borderColor: 'var(--border-subtle)', color: '#D64545' }}
                      title="Delete"
                    >
                      Del
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-end gap-2">
                  <textarea
                    id={`notes-${entry.id}`}
                    defaultValue={entry.admin_notes || ''}
                    placeholder="Admin notes..."
                    rows={2}
                    className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-xs"
                    style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById(`notes-${entry.id}`);
                      if (el) saveNotes(entry.id, el.value);
                    }}
                    disabled={notesSaving === entry.id}
                    className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    style={{ background: notesSaved === entry.id ? '#34A853' : 'var(--purple)' }}
                  >
                    {notesSaving === entry.id ? 'Saving...' : notesSaved === entry.id ? 'Saved!' : 'Save'}
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
