'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/lib/blog';
import { useRouteCleanup } from '@/hooks/useRouteCleanup';

/* ── constants ──────────────────────────────────────── */

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota',
  'Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
  'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon',
  'Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah',
  'Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

const CA_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
  'Prince Edward Island', 'Quebec', 'Saskatchewan',
  'Northwest Territories', 'Nunavut', 'Yukon',
];

const COUNTRIES = [
  'Australia',
  // Europe
  'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina',
  'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia',
  'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland',
  'Italy', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'New Zealand', 'North Macedonia',
  'Norway', 'Poland', 'Portugal', 'Romania', 'Serbia', 'Slovakia', 'Slovenia',
  'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom',
];

const REGIONS = [
  { label: 'US States', options: US_STATES },
  { label: 'Canadian Provinces', options: CA_PROVINCES },
  { label: 'Countries', options: COUNTRIES },
];

const TIERS = [
  { id: 1, label: 'Tier 1 — Deprescribing', category: 'tier1_deprescribing', color: '#10B981' },
  { id: 2, label: 'Tier 2 — Holistic/Integrative', category: 'tier2_holistic', color: '#3B82F6' },
  { id: 3, label: 'Tier 3 — Conservative Prescribing', category: 'tier3_conservative', color: '#E8A838' },
  { id: 4, label: 'Tier 4 — General Prescribers', category: 'tier4_general', color: '#6B6580' },
  { id: 5, label: 'Tier 5 — NP/PMHNP', category: 'tier5_np_pmhnp', color: '#8B5CF6' },
];

const TIER_COLORS = Object.fromEntries(TIERS.map(t => [t.category, t.color]));
const TIER_LABELS = Object.fromEntries(TIERS.map(t => [t.category, t.label]));

/* ── main component ─────────────────────────────────── */

export default function ClinicianDiscovery() {
  useRouteCleanup();
  const { user, loading: authLoading } = useAuth();

  // form state
  const [region, setRegion] = useState('');
  const [selectedTiers, setSelectedTiers] = useState([1, 2, 3, 4, 5]);

  // discovery state
  const [results, setResults] = useState([]);
  const [duplicatesSkipped, setDuplicatesSkipped] = useState(0);
  const [discovering, setDiscovering] = useState(false);
  const [discoveryError, setDiscoveryError] = useState(null);
  const [discoveryMessage, setDiscoveryMessage] = useState(null);

  // add-to-CRM state
  const [addingIds, setAddingIds] = useState(new Set());
  const [addedIds, setAddedIds] = useState(new Set());
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [bulkAdding, setBulkAdding] = useState(null);

  /* ── handlers ──────────────────────────────────────── */

  const toggleTier = (id) => {
    setSelectedTiers(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const runDiscovery = async () => {
    if (!region) { setDiscoveryError('Please select a region.'); return; }
    if (selectedTiers.length === 0) { setDiscoveryError('Select at least one tier.'); return; }

    setDiscovering(true);
    setDiscoveryError(null);
    setDiscoveryMessage(null);
    setResults([]);
    setAddedIds(new Set());
    setDismissedIds(new Set());
    setDuplicatesSkipped(0);

    try {
      const res = await fetch('/api/admin/clinician-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region, tiers: selectedTiers }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Discovery failed');

      setResults(json.results || []);
      setDuplicatesSkipped(json.duplicatesSkipped || 0);
      if (json.message) setDiscoveryMessage(json.message);
    } catch (err) {
      setDiscoveryError(err.message);
    } finally {
      setDiscovering(false);
    }
  };

  const addToCRM = async (entry) => {
    setAddingIds(prev => new Set(prev).add(entry._id));
    try {
      const res = await fetch('/api/admin/clinician-discovery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: [entry] }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add');
      setAddedIds(prev => new Set(prev).add(entry._id));
    } catch (err) {
      alert(`Failed to add ${entry.name}: ${err.message}`);
    } finally {
      setAddingIds(prev => { const n = new Set(prev); n.delete(entry._id); return n; });
    }
  };

  const dismissEntry = (id) => {
    setDismissedIds(prev => new Set(prev).add(id));
  };

  const bulkAddTier = async (tierCategory) => {
    const entries = visibleResults.filter(r =>
      r.category === tierCategory && !addedIds.has(r._id) && !dismissedIds.has(r._id)
    );
    if (entries.length === 0) return;

    setBulkAdding(tierCategory);
    try {
      const res = await fetch('/api/admin/clinician-discovery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Bulk add failed');
      setAddedIds(prev => {
        const n = new Set(prev);
        entries.forEach(e => n.add(e._id));
        return n;
      });
    } catch (err) {
      alert(`Bulk add failed: ${err.message}`);
    } finally {
      setBulkAdding(null);
    }
  };

  // Tag each result with a stable ID
  const taggedResults = results.map((r, i) => ({ ...r, _id: `${r.name}-${r.source}-${i}` }));
  const visibleResults = taggedResults.filter(r => !dismissedIds.has(r._id));

  /* ── auth guard ────────────────────────────────────── */

  if (authLoading) return <p className="p-8 text-text-muted">Loading...</p>;
  if (!user || !isAdmin(user.id)) return <p className="p-8 text-text-muted">Not authorized.</p>;

  /* ── render ────────────────────────────────────────── */

  return (
    <div className="space-y-5">

      {/* ── header ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl font-semibold text-foreground">Clinician Discovery</h1>
          <p className="mt-0.5 text-xs text-text-muted">
            AI-powered discovery — results should be verified before outreach
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="rounded-lg border px-3 py-1.5 text-xs font-medium no-underline transition hover:opacity-80"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          &larr; Analytics
        </Link>
        <Link
          href="/admin/clinician-crm"
          className="rounded-lg border px-3 py-1.5 text-xs font-medium no-underline transition hover:opacity-80"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          Clinician CRM
        </Link>
      </div>

      {/* ── search controls ─────────────────────────── */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)' }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

          {/* Region selector */}
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-text-muted">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--purple-ghost)' }}
            >
              <option value="">Select a region...</option>
              {REGIONS.map(group => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Tier checkboxes */}
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-text-muted">Tiers to discover</label>
            <div className="flex flex-wrap gap-2">
              {TIERS.map(tier => (
                <label
                  key={tier.id}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition"
                  style={{
                    borderColor: selectedTiers.includes(tier.id) ? tier.color : 'var(--border-subtle)',
                    background: selectedTiers.includes(tier.id) ? `${tier.color}15` : 'transparent',
                    color: selectedTiers.includes(tier.id) ? tier.color : 'var(--text-muted)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTiers.includes(tier.id)}
                    onChange={() => toggleTier(tier.id)}
                    className="sr-only"
                  />
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: tier.color, opacity: selectedTiers.includes(tier.id) ? 1 : 0.3 }}
                  />
                  {tier.label}
                </label>
              ))}
            </div>
          </div>

          {/* Run button */}
          <button
            onClick={runDiscovery}
            disabled={discovering}
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--purple)' }}
          >
            {discovering ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Discovering...
              </span>
            ) : (
              'Run Discovery'
            )}
          </button>
        </div>

        {discoveryError && (
          <p className="mt-3 text-xs text-red-500">{discoveryError}</p>
        )}
      </div>

      {/* ── results ─────────────────────────────────── */}
      {(visibleResults.length > 0 || discoveryMessage || duplicatesSkipped > 0) && (
        <div className="space-y-3">

          {/* summary bar */}
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-foreground">
              {visibleResults.length} result{visibleResults.length !== 1 ? 's' : ''}
              {duplicatesSkipped > 0 && (
                <span className="text-text-muted"> ({duplicatesSkipped} duplicates skipped)</span>
              )}
            </p>
            {discoveryMessage && (
              <p className="text-xs text-text-muted">{discoveryMessage}</p>
            )}

            {/* bulk add buttons */}
            <div className="ml-auto flex flex-wrap gap-2">
              {TIERS.filter(t => selectedTiers.includes(t.id)).map(tier => {
                const count = visibleResults.filter(r =>
                  r.category === tier.category && !addedIds.has(r._id) && !dismissedIds.has(r._id)
                ).length;
                if (count === 0) return null;
                return (
                  <button
                    key={tier.id}
                    onClick={() => bulkAddTier(tier.category)}
                    disabled={bulkAdding === tier.category}
                    className="rounded-lg border px-3 py-1.5 text-[11px] font-medium transition hover:opacity-80 disabled:opacity-50"
                    style={{ borderColor: tier.color, color: tier.color }}
                  >
                    {bulkAdding === tier.category ? 'Adding...' : `Add All ${tier.label.split(' — ')[0]} (${count})`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* results cards */}
          <div className="space-y-2">
            {visibleResults.map((r) => (
              <div
                key={r._id}
                className="rounded-xl border p-4 transition"
                style={{
                  borderColor: addedIds.has(r._id) ? '#10B981' : 'var(--border-subtle)',
                  background: addedIds.has(r._id) ? '#10B98108' : 'var(--surface-strong)',
                }}
              >
                <div className="flex flex-wrap items-start gap-3">
                  {/* Left: info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{r.name}</span>
                      {r.credentials && (
                        <span className="rounded-md border px-1.5 py-0.5 text-[10px] font-medium text-text-muted" style={{ borderColor: 'var(--border-subtle)' }}>
                          {r.credentials}
                        </span>
                      )}
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                        style={{ background: TIER_COLORS[r.category] || '#6B6580' }}
                      >
                        {TIER_LABELS[r.category]?.split(' — ')[0] || r.category}
                      </span>
                    </div>
                    {r.clinic && (
                      <p className="mt-1 text-xs text-foreground">{r.clinic}</p>
                    )}
                    <p className="mt-0.5 text-xs text-text-muted">
                      {r.location || r.state || '—'}
                      {r.phone && <> &middot; {r.phone}</>}
                    </p>
                    {r.description && (
                      <p className="mt-1 text-xs text-text-muted" style={{ maxWidth: 500 }}>{r.description}</p>
                    )}
                    {/* Links row */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {r.email_website && (
                        <a
                          href={r.email_website.startsWith('http') ? r.email_website : `https://${r.email_website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium no-underline transition hover:opacity-80"
                          style={{ borderColor: 'var(--purple)', color: 'var(--purple)' }}
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                          Visit Website
                        </a>
                      )}
                      {r.source && (
                        <span className="text-[10px] text-text-subtle">via {r.source}</span>
                      )}
                      {/* Google search fallback */}
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(`"${r.name}" ${r.clinic || ''} ${r.location || r.state || ''}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-text-subtle no-underline hover:text-foreground"
                      >
                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        Google
                      </a>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    {addedIds.has(r._id) ? (
                      <span className="rounded-md bg-green-50 px-3 py-1.5 text-[11px] font-semibold text-green-600">Added to CRM</span>
                    ) : (
                      <>
                        <button
                          onClick={() => addToCRM(r)}
                          disabled={addingIds.has(r._id)}
                          className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                          style={{ background: 'var(--purple)' }}
                        >
                          {addingIds.has(r._id) ? '...' : 'Add to CRM'}
                        </button>
                        <button
                          onClick={() => dismissEntry(r._id)}
                          className="rounded-md border px-3 py-1.5 text-[11px] font-medium text-text-muted transition hover:opacity-80"
                          style={{ borderColor: 'var(--border-subtle)' }}
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* empty state after discovery */}
      {!discovering && results.length === 0 && discoveryMessage && (
        <div className="py-12 text-center">
          <p className="text-sm text-text-muted">{discoveryMessage}</p>
        </div>
      )}
    </div>
  );
}
