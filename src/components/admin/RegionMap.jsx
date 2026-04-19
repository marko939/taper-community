'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getCentroid } from '@/lib/regionCentroids';

// Same helper pattern as DeprescribingMap.jsx — browser caches the stylesheet
// after it loads once, so navigating between /admin/analytics and /deprescribers
// shares the same CSS.
function loadCSS(href) {
  if (typeof document === 'undefined') return Promise.resolve();
  if (document.querySelector(`link[href="${href}"]`)) return Promise.resolve();
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = resolve;
    document.head.appendChild(link);
  });
}

/**
 * Global member distribution map. One circle per region, radius scaled by
 * memberCount (sqrt so a region with 400 members doesn't eclipse one with 4).
 */
export default function RegionMap({ regions = [] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // Stable reference for the points we're going to plot. Filtered to regions
  // with >0 members and a known centroid. `useMemo` so React doesn't re-derive
  // on every render.
  const points = useMemo(() => {
    const out = [];
    const missing = [];
    for (const r of regions) {
      if (!r || !r.memberCount || r.memberCount <= 0) continue;
      const centroid = getCentroid(r.code);
      if (!centroid) {
        missing.push(r.code);
        continue;
      }
      out.push({ ...r, latlng: centroid });
    }
    if (missing.length && typeof console !== 'undefined') {
      console.warn('[RegionMap] no centroid for region codes:', missing);
    }
    return out;
  }, [regions]);

  const totalMembers = useMemo(
    () => points.reduce((sum, p) => sum + p.memberCount, 0),
    [points]
  );

  // Initialize the map once. We redraw markers in a separate effect when
  // `points` changes so we don't tear the whole map down.
  useEffect(() => {
    if (mapInstanceRef.current) return;
    let cancelled = false;

    async function initMap() {
      const [, leafletModule] = await Promise.all([
        loadCSS('https://unpkg.com/leaflet@1.9.3/dist/leaflet.css'),
        import('leaflet'),
      ]);
      if (cancelled || !mapRef.current) return;
      const L = leafletModule.default;

      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        // Fine-grained zoom: snap to quarter steps, +/- buttons move half a
        // step, and scroll wheel needs ~200 px of movement per whole zoom level
        // (default is 60) — feels like a smooth, gentle zoom instead of big
        // jumps.
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        wheelDebounceTime: 40,
        wheelPxPerZoomLevel: 200,
        worldCopyJump: true,
      }).setView([30, -20], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 8,
        minZoom: 1,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      setLoaded(true);
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, []);

  // (Re)draw markers whenever the points list changes.
  useEffect(() => {
    if (!loaded || !layerGroupRef.current) return;
    const group = layerGroupRef.current;
    group.clearLayers();
    // Leaflet is attached to window.L after first load; safer to pull it off
    // the map instance.
    const map = mapInstanceRef.current;
    if (!map) return;
    // eslint-disable-next-line no-underscore-dangle
    const L = window.L || (map.options && map.options.L);
    if (!L) return;

    for (const p of points) {
      const radius = Math.sqrt(p.memberCount) * 4 + 4;
      const marker = L.circleMarker(p.latlng, {
        radius,
        color: '#5B2E91',
        weight: 1.5,
        fillColor: '#5B2E91',
        fillOpacity: 0.45,
      });
      marker.bindPopup(
        `<strong>${escapeHtml(p.label)}</strong><br/>${p.memberCount} member${p.memberCount === 1 ? '' : 's'}`
      );
      marker.bindTooltip(`${p.label}: ${p.memberCount}`, { direction: 'top' });
      marker.addTo(group);
    }
  }, [loaded, points]);

  if (!regions || regions.length === 0) {
    return (
      <div
        className="rounded-2xl border p-5"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)', boxShadow: 'var(--shadow-soft)' }}
      >
        <h2 className="text-sm font-semibold text-foreground">Global Member Distribution</h2>
        <p className="mt-2 text-xs text-text-subtle">
          No regional data yet. Members will appear once signups populate{' '}
          <code className="rounded bg-[var(--purple-ghost)] px-1">profiles.region_code</code>.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-strong)', boxShadow: 'var(--shadow-soft)' }}
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Global Member Distribution</h2>
        <span className="text-[11px] text-text-subtle">
          {points.length} region{points.length === 1 ? '' : 's'} · {totalMembers} member{totalMembers === 1 ? '' : 's'} · bubble size scales with member count
        </span>
      </div>
      <div
        ref={mapRef}
        className="h-80 w-full rounded-lg"
        style={{ background: '#E6E2EF' }}
        aria-label="World map showing Taper Community member distribution by region"
      />
    </div>
  );
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[m]));
}
