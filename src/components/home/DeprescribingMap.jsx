'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useClinicianStore } from '@/stores/clinicianStore';
import { useAuthStore } from '@/stores/authStore';
import MatchRequestModal from '@/components/map/MatchRequestModal';

// Fallback to hardcoded data if Supabase fetch fails
import { DEPRESCRIBERS } from '@/lib/deprescribers';

function loadCSS(href) {
  if (document.querySelector(`link[href="${href}"]`)) return Promise.resolve();
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = resolve; // resolve anyway to not block
    document.head.appendChild(link);
  });
}

export default function DeprescribingMap({ compact = false }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const mapClickHandlerRef = useRef(null);
  const timersRef = useRef([]);
  const [loaded, setLoaded] = useState(false);
  const user = useAuthStore((s) => s.user);
  const clinicians = useClinicianStore((s) => s.clinicians);
  const cliniciansLoaded = useClinicianStore((s) => s.cliniciansLoaded);
  const fetchClinicians = useClinicianStore((s) => s.fetchClinicians);
  const [selectedClinician, setSelectedClinician] = useState(null);

  // Use Supabase clinicians if loaded, fallback to hardcoded
  // Always merge in featured providers (those with photos) from hardcoded data
  // Filter out removed providers by name+location
  const REMOVED = [
    { name: 'Field Trip Health Nurse Practitioner Services', location: 'Toronto' },
    { name: 'Monica Mina, RN(EC), MN, NP-Adult', location: 'Ontario' },
    { name: 'Outro Health' },
  ];
  const isRemoved = (d) => REMOVED.some((r) => d.name?.includes(r.name) && (!r.location || d.location?.includes(r.location)));
  const base = (cliniciansLoaded && clinicians.length > 0 ? clinicians : DEPRESCRIBERS).filter((d) => !isRemoved(d));
  const featured = DEPRESCRIBERS.filter((d) => d.photo && !base.some((b) => b.name === d.name));
  const providers = featured.length > 0 ? [...base, ...featured] : base;
  const providerCount = new Set(providers.map((d) => d.name)).size;

  // Fetch clinicians from Supabase
  useEffect(() => {
    fetchClinicians();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mapInstanceRef.current) return;

    let cancelled = false;

    async function initMap() {
      // Load CSS and JS in parallel
      const [, , , leafletModule] = await Promise.all([
        loadCSS('https://unpkg.com/leaflet@1.9.3/dist/leaflet.css'),
        loadCSS('https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css'),
        loadCSS('https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css'),
        import('leaflet'),
      ]);
      const L = leafletModule.default;
      await import('leaflet.markercluster');

      if (cancelled || !mapRef.current) return;

      // Fix default icon paths for bundlers
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        scrollWheelZoom: !compact,
        dragging: !compact || !L.Browser.mobile,
      }).setView([30, -40], compact ? 2 : 3);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const markers = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
      });

      const purpleIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 28px; height: 28px;
          background: #5B2E91;
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(91,46,145,0.4);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      for (const item of providers) {
        const marker = L.marker([item.latitude, item.longitude], { icon: purpleIcon });
        const escapedName = (item.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const photoHtml = item.photo
          ? `<div style="display: flex; gap: 12px; align-items: flex-start;">
              <img src="${item.photo}" alt="${item.name}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid #5B2E91;" />
              <div>`
          : '<div>';
        const photoClose = item.photo ? '</div></div>' : '';
        marker.bindPopup(`
          <div style="font-family: 'DM Sans', system-ui, sans-serif; max-width: 320px;">
            ${photoHtml}
            <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1E1B2E;">${item.name}</p>
            <p style="margin: 0 0 8px; font-size: 12px; color: #6B6580;">${item.role}</p>
            <p style="margin: 0 0 4px; font-size: 12px;"><strong style="color: #5B2E91;">Clinic:</strong> <span style="color: #1E1B2E;">${item.clinic}</span></p>
            <p style="margin: 0 0 8px; font-size: 12px;"><strong style="color: #5B2E91;">Location:</strong> <span style="color: #1E1B2E;">${item.location}</span></p>
            ${photoClose}
            <p style="margin: 0 0 10px; font-size: 11px; line-height: 1.5; color: #6B6580;">${item.description}</p>
            <button
              data-clinician-id="${item.id || ''}"
              data-clinician-name="${escapedName}"
              style="
                display: block; width: 100%; padding: 8px 0;
                background: #5B2E91; color: white; border: none; border-radius: 8px;
                font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
                cursor: pointer;
              "
            >Contact ${item.name.split(' ')[0]}</button>
          </div>
        `, { maxWidth: 300 });
        markers.addLayer(marker);
      }

      map.addLayer(markers);
      mapInstanceRef.current = map;
      setLoaded(true);

      // Delegated click handler for Contact buttons in Leaflet popups
      const mapClickHandler = (e) => {
        const btn = e.target.closest('[data-clinician-id]');
        if (!btn) return;
        const clinicianId = btn.getAttribute('data-clinician-id');
        let match = null;
        if (clinicianId) {
          match = providers.find((c) => c.id === clinicianId);
        } else {
          // Fallback for hardcoded data (no id) — match by name
          const name = btn.getAttribute('data-clinician-name')?.replace(/&quot;/g, '"')?.replace(/\\'/g, "'");
          match = providers.find((c) => c.name === name);
        }
        if (match) {
          // Close the Leaflet popup so it doesn't cover the modal
          map.closePopup();
          setSelectedClinician(match);
          // Scroll to top so modal is fully visible
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
      mapClickHandlerRef.current = mapClickHandler;
      map.getContainer().addEventListener('click', mapClickHandler);

      // Invalidate size multiple times to ensure tiles render after visibility change
      const t1 = setTimeout(() => map.invalidateSize(), 100);
      const t2 = setTimeout(() => map.invalidateSize(), 500);
      const t3 = setTimeout(() => map.invalidateSize(), 1000);
      timersRef.current = [t1, t2, t3];
    }

    initMap().catch((err) => {
      console.error('Map init failed:', err);
    });

    return () => {
      cancelled = true;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      if (mapInstanceRef.current) {
        if (mapClickHandlerRef.current) {
          mapInstanceRef.current.getContainer()?.removeEventListener('click', mapClickHandlerRef.current);
          mapClickHandlerRef.current = null;
        }
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [compact, providers]);

  const mapHeight = compact ? 'h-[420px]' : 'h-[600px] lg:h-[700px]';

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-eyebrow">Find Support Near You</p>
          {compact ? (
            <h2 className="mt-1 font-serif text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              Deprescribing Providers
            </h2>
          ) : (
            <h1 className="mt-1 font-serif text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              Find a Deprescribing Provider Near You
            </h1>
          )}
          <p className="mt-2 max-w-xl text-sm" style={{ color: 'var(--text-muted)' }}>
            {providerCount}+ clinicians worldwide who specialize in safe, guided medication tapering.
            Click any marker to see provider details.
          </p>
        </div>
        {compact && (
          <Link
            href="/deprescribers"
            className="btn btn-primary shrink-0 text-sm no-underline"
          >
            View Full Map
          </Link>
        )}
      </div>

      {/* Map container */}
      <div className="glass-panel overflow-hidden" style={{ position: 'relative' }}>
        {!loaded && (
          <div
            className={`flex items-center justify-center ${mapHeight}`}
            style={{ background: 'var(--purple-ghost)' }}
          >
            <div className="text-center">
              <div
                className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-purple-pale"
                style={{ borderTopColor: 'var(--purple)' }}
              />
              <p className="text-sm text-text-muted">Loading map...</p>
            </div>
          </div>
        )}
        <div
          ref={mapRef}
          className={`${mapHeight} w-full`}
          style={loaded ? { zIndex: 1, filter: !user ? 'blur(3px)' : undefined, pointerEvents: !user ? 'none' : undefined } : { position: 'absolute', top: 0, left: 0, visibility: 'hidden', zIndex: -1 }}
        />
        {loaded && !user && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(2px)',
          }}>
            <div
              className="rounded-2xl border p-8 text-center"
              style={{ borderColor: 'var(--border-subtle)', background: 'rgba(255,255,255,0.95)', maxWidth: 400, boxShadow: '0 8px 32px rgba(91,46,145,0.15)' }}
            >
              <svg className="mx-auto mb-3 h-8 w-8" style={{ color: 'var(--purple)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-foreground">Sign in to find a deprescriber</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-text-muted">
                Create a free account to browse {providerCount}+ deprescribing providers across 6 countries.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/auth/signin" className="btn btn-primary text-sm no-underline">Sign In</Link>
                <Link href="/auth/signup" className="btn btn-secondary text-sm no-underline">Create Free Account</Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats footer */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border-subtle bg-surface-strong px-4 py-3 text-center">
          <p className="text-lg font-bold text-purple">{providerCount}+</p>
          <p className="text-xs text-text-subtle">Providers</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-strong px-4 py-3 text-center">
          <p className="text-lg font-bold text-purple">6</p>
          <p className="text-xs text-text-subtle">Countries</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface-strong px-4 py-3 text-center">
          <p className="text-lg font-bold text-purple">30+</p>
          <p className="text-xs text-text-subtle">US States</p>
        </div>
      </div>

      {/* Match Request Modal — portal to escape map stacking context */}
      {selectedClinician && createPortal(
        <MatchRequestModal
          clinician={selectedClinician}
          onClose={() => setSelectedClinician(null)}
        />,
        document.body
      )}
    </section>
  );
}
