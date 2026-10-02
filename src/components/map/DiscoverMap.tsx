'use client';

// Nextdoor-style discover map, adapted for PlugPay buildings.
// Spec ported from nextdoor.co.ke's ad-map.js: Leaflet + CARTO Voyager tiles with a
// CSS-filtered tile pane, 36px rounded-square photo pins with count pills, hover
// tooltips with uppercase meta, a floating category capsule, two-stage tap on touch,
// layer repaints without map rebuilds, and fitBounds after filtering.
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import type * as LType from 'leaflet';

export interface MapBuilding {
  id: string;
  slug: string;
  name: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  image_url: string | null;
  stalls: number;
  merchants: number;
  rating: number;
  verified: boolean;
  categories: string[];
}

const CBD: [number, number] = [-1.286389, 36.817223];

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(la1) * Math.cos(la2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function fmtDist(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function DiscoverMap({ spots }: { spots: MapBuilding[] }) {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LType.Map | null>(null);
  const layerRef = useRef<LType.LayerGroup | null>(null);
  const pinsRef = useRef<Map<string, LType.Marker>>(new Map());
  const tipsRef = useRef<Map<string, LType.Tooltip>>(new Map());
  const lastTap = useRef<{ key: string; t: number }>({ key: '', t: 0 });
  const lastFit = useRef<string>('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMe, setNearMe] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  // load leaflet client-side only (its UMD bundle touches window on import)
  useEffect(() => {
    let mounted = true;
    import('leaflet').then((mod) => {
      if (!mounted) return;
      LRef.current = mod.default ?? mod;
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // init map once
  useEffect(() => {
    const L = LRef.current;
    if (!ready || !L || mapRef.current || !mapEl.current) return;
    const map = L.map(mapEl.current, {
      center: CBD,
      zoom: 15,
      zoomControl: false,
      scrollWheelZoom: true,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
        maxZoom: 19,
        maxNativeZoom: 16,
        detectRetina: false,
      },
    ).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    const t = window.setTimeout(() => map.invalidateSize(), 80);
    // Leaflet caches container size at creation; repaint after viewport changes
    const ro = new ResizeObserver(() => {
      window.clearTimeout(t);
      window.setTimeout(() => map.invalidateSize(), 150);
    });
    ro.observe(mapEl.current);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      pinsRef.current.clear();
      tipsRef.current.clear();
    };
  }, [ready]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of spots) {
      const seen = new Set<string>();
      for (const c of s.categories) {
        if (!seen.has(c)) {
          counts.set(c, (counts.get(c) ?? 0) + 1);
          seen.add(c);
        }
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [spots]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = spots.filter((s) => {
      if (cat !== 'All' && !s.categories.includes(cat)) return false;
      if (term && !`${s.name} ${s.address} ${s.area} ${s.categories.join(' ')}`.toLowerCase().includes(term)) return false;
      return true;
    });
    if (me && nearMe) {
      list = [...list].sort(
        (a, b) => haversineKm(me, a) - haversineKm(me, b),
      );
    }
    return list;
  }, [spots, cat, q, me, nearMe]);

  const fitKey = `${cat}|${q}|${filtered.length}`;

  // repaint pins + fit bounds on filter change (no map rebuild, nextdoor-style)
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !map || !layer) return;

    layer.clearLayers();
    pinsRef.current.clear();
    tipsRef.current.clear();

    const isTouch =
      typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

    for (const s of filtered) {
      const el = document.createElement('div');
      el.className = 'pp-pin';
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `${s.name}, ${s.merchants} verified traders`);
      if (s.image_url) {
        const img = document.createElement('img');
        img.src = s.image_url;
        img.alt = '';
        el.appendChild(img);
      } else {
        const fb = document.createElement('div');
        fb.className = 'pp-pin-fb';
        fb.innerHTML =
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2"><path d="M3 21h18M5 21V5l7-2v18M12 21V9l7 2v10"/></svg>';
        el.appendChild(fb);
      }
      const pill = document.createElement('span');
      pill.className = 'pp-pin-count';
      pill.textContent = String(s.merchants);
      el.appendChild(pill);

      const icon = L.divIcon({
        html: el,
        className: 'pp-pin-wrap',
        iconSize: [36, 36],
        iconAnchor: [18, 40],
      });

      const meta = [
        `${s.merchants} verified trader${s.merchants === 1 ? '' : 's'}`,
        me ? fmtDist(haversineKm(me, s)) : s.area,
      ].join(' · ');

      const tip = L.tooltip({
        direction: 'top',
        offset: [0, -10],
        className: 'pp-map-tip',
        opacity: 1,
      });
      const tipEl = document.createElement('div');
      const swatch = document.createElement('span');
      swatch.className = 'pp-tip-sw';
      if (s.image_url) {
        const im = document.createElement('img');
        im.src = s.image_url;
        im.alt = '';
        swatch.appendChild(im);
      }
      const nameEl = document.createElement('div');
      nameEl.className = 'pp-tip-name';
      nameEl.textContent = s.name;
      const metaEl = document.createElement('div');
      metaEl.className = 'pp-tip-meta';
      metaEl.textContent = meta.toUpperCase();
      tipEl.appendChild(swatch);
      tipEl.appendChild(nameEl);
      tipEl.appendChild(metaEl);
      tip.setContent(tipEl);

      const marker = L.marker([s.lat, s.lng], { icon, riseOnHover: true });
      marker.bindTooltip(tip);

      const openTip = () => {
        for (const [, t] of tipsRef.current) t.close();
        tip.openOn(map);
      };

      marker.on('click', () => {
        const now = Date.now();
        const armed = lastTap.current.key === s.slug && now - lastTap.current.t < 900;
        lastTap.current = { key: s.slug, t: now };
        if (isTouch && !armed) {
          // two-stage tap: first tap previews, second tap selects
          openTip();
          return;
        }
        openTip();
        setActive(s.slug);
        map.flyTo([s.lat, s.lng], Math.max(map.getZoom(), 16), { duration: 0.5 });
        document.getElementById(`spot-${s.slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });

      marker.addTo(layer);
      pinsRef.current.set(s.slug, marker);
      tipsRef.current.set(s.slug, tip);
    }

    if (filtered.length > 0 && lastFit.current !== fitKey) {
      lastFit.current = fitKey;
      const bounds = L.latLngBounds(filtered.map((s) => [s.lat, s.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
    }
  }, [ready, filtered, me, fitKey]);

  function locate() {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setGeoMsg('Location is not supported on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearMe(true);
        setGeoMsg(null);
      },
      () =>
        setGeoMsg(
          'Could not read your location. Allow location access in your browser, then try again.',
        ),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    );
  }

  function focusSpot(s: MapBuilding) {
    const map = mapRef.current;
    setActive(s.slug);
    if (!map) return;
    const tip = tipsRef.current.get(s.slug);
    if (tip) {
      for (const [, t] of tipsRef.current) t.close();
      tip.openOn(map);
    }
    map.flyTo([s.lat, s.lng], Math.max(map.getZoom(), 16), { duration: 0.5 });
  }

  return (
    <div className="dm">
      <div className="dm-map" ref={mapEl} aria-label="Map of verified PlugPay buildings in Nairobi CBD">
        <div className="dm-search-float">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b6178" strokeWidth="2.4" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search buildings, streets or trades"
            aria-label="Search the map"
          />
        </div>

        <div className="dm-cats" role="group" aria-label="Filter by trade">
          <button className={`dm-cat ${cat === 'All' ? 'on' : ''}`} onClick={() => setCat('All')}>
            All <i>{spots.length}</i>
          </button>
          {categories.map(([c, n]) => (
            <button key={c} className={`dm-cat ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
              {c} <i>{n > 9 ? '9+' : n}</i>
            </button>
          ))}
        </div>

        <div className="dm-near">
          <button
            className={`dm-near-btn ${nearMe ? 'on' : ''}`}
            onClick={() => (me && !nearMe ? setNearMe(true) : nearMe ? setNearMe(false) : locate())}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <circle cx="12" cy="12" r="3.2" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
            {nearMe ? 'Near me on' : 'Near me'}
          </button>
          {geoMsg && <div className="dm-near-msg">{geoMsg}</div>}
        </div>
      </div>

      <aside className="dm-side">
        <div className="dm-handle" aria-hidden="true" />
        <div className="dm-side-head">
          <div className="dm-count">
            Nearby <b>({filtered.length})</b>
            {me && nearMe && <span className="dm-sorted"> · sorted by distance</span>}
          </div>
          {cat !== 'All' && (
            <button className="dm-clear" onClick={() => setCat('All')}>
              {cat} ×
            </button>
          )}
        </div>

        <div className="dm-cards">
          {filtered.length === 0 && (
            <div className="dm-empty">
              <strong>No building matches &quot;{q}&quot;</strong>
              Try a street like Moi Avenue, or clear the trade filter to see all{' '}
              {spots.length} mapped buildings.
            </div>
          )}
          {filtered.map((s) => (
            <div
              key={s.id}
              id={`spot-${s.slug}`}
              className={`res-card dm-card ${active === s.slug ? 'dm-card-on' : ''}`}
              onClick={() => focusSpot(s)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && focusSpot(s)}
            >
              <div className="dm-card-media">
                {s.image_url && (
                  <img src={s.image_url} alt={s.name} loading="lazy" width={400} height={130} />
                )}
                {me && (
                  <span className="dm-dist">{fmtDist(haversineKm(me, s))}</span>
                )}
              </div>
              <div className="rc-top" style={{ marginBottom: 8 }}>
                <span className="rc-info">
                  <span className="rc-name">{s.name}</span>
                  <span className="rc-sub" style={{ display: 'block' }}>
                    {s.address} · {s.area}
                  </span>
                  {s.verified && <span className="rc-badge rcb-v">✓ Verified building</span>}
                </span>
              </div>
              <div className="rc-stats">
                <div className="rcs"><div className="rcs-n">{s.merchants}</div><div className="rcs-l">Traders</div></div>
                <div className="rcs"><div className="rcs-n">{s.stalls}</div><div className="rcs-l">Stalls</div></div>
                <div className="rcs"><div className="rcs-n">{Number(s.rating).toFixed(1)}★</div><div className="rcs-l">Avg</div></div>
              </div>
              <div className="dm-card-actions">
                <Link
                  href={`/buildings/${s.slug}`}
                  className="rc-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open floor map →
                </Link>
                <a
                  className="dm-mini"
                  title="Directions"
                  aria-label={`Directions to ${s.name}`}
                  href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 2 12l10 10 10-10z" /><path d="m9 15 6-6" /></svg>
                </a>
                <a
                  className="dm-mini"
                  title="Share on WhatsApp"
                  aria-label={`Share ${s.name} on WhatsApp`}
                  href={`https://wa.me/?text=${encodeURIComponent(`Check ${s.name} on PlugPay: ${s.merchants} verified traders, ${s.address}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5 13.9c-.2.6-1.2 1.1-1.7 1.2-.5 0-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.4 1.5 2.7 1.6.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4 0 .1 0 .7-.2 1.3Z" /></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
