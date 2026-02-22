'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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
  const [loaded, setLoaded] = useState(false);
  const [providerCount] = useState(
    new Set(DEPRESCRIBERS.map((d) => d.name)).size
  );

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

      for (const item of DEPRESCRIBERS) {
        const marker = L.marker([item.latitude, item.longitude], { icon: purpleIcon });
        marker.bindPopup(`
          <div style="font-family: 'DM Sans', system-ui, sans-serif; max-width: 280px;">
            <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1E1B2E;">${item.name}</p>
            <p style="margin: 0 0 8px; font-size: 12px; color: #6B6580;">${item.role}</p>
            <p style="margin: 0 0 4px; font-size: 12px;"><strong style="color: #5B2E91;">Clinic:</strong> <span style="color: #1E1B2E;">${item.clinic}</span></p>
            <p style="margin: 0 0 8px; font-size: 12px;"><strong style="color: #5B2E91;">Location:</strong> <span style="color: #1E1B2E;">${item.location}</span></p>
            <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #6B6580;">${item.description}</p>
          </div>
        `, { maxWidth: 300 });
        markers.addLayer(marker);
      }

      map.addLayer(markers);
      mapInstanceRef.current = map;
      setLoaded(true);

      // Invalidate size multiple times to ensure tiles render after visibility change
      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 500);
      setTimeout(() => map.invalidateSize(), 1000);
    }

    initMap().catch((err) => {
      console.error('Map init failed:', err);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [compact]);

  const mapHeight = compact ? 'h-[420px]' : 'h-[600px] lg:h-[700px]';

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-eyebrow">Find Support Near You</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
            Deprescribing Providers
          </h2>
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
          style={loaded ? { zIndex: 1 } : { position: 'absolute', top: 0, left: 0, visibility: 'hidden', zIndex: -1 }}
        />
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
    </section>
  );
}
