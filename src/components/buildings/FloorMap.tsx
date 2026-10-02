'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Merchant, Stall } from '@/lib/types';

const LEGEND = [
  { key: 'trusted', label: 'Trusted', cls: 'bsg-t' },
  { key: 'verified', label: 'Verified', cls: 'bsg-v' },
  { key: 'basic', label: 'Registered', cls: 'bsg-b' },
  { key: 'unregistered', label: 'Vacant', cls: 'bsg-e' },
] as const;

const STALLS_PER_ROW = 12;

export function FloorMap({ floors, stalls, merchants }: { floors: string[]; stalls: Stall[]; merchants: Merchant[] }) {
  const [floor, setFloor] = useState(floors[0] ?? 'Ground');
  const [selected, setSelected] = useState<Stall | null>(null);

  const bySlug = useMemo(() => new Map(merchants.map((m) => [m.slug, m])), [merchants]);
  const floorStalls = useMemo(() => stalls.filter((s) => s.floor === floor), [stalls, floor]);
  const merchantsHere = useMemo(
    () => merchants.filter((m) => floorStalls.some((s) => s.merchant_slug === m.slug)),
    [merchants, floorStalls],
  );

  function stallLabel(s: Stall): string {
    if (s.merchant_slug && bySlug.has(s.merchant_slug)) {
      const names = bySlug.get(s.merchant_slug)!.business_name.split(' ');
      return names.slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    }
    return '';
  }

  // pad the grid so the map keeps a rectangular shape
  const padded = [...floorStalls];
  const remainder = padded.length % STALLS_PER_ROW;
  if (remainder > 0) {
    for (let i = 0; i < STALLS_PER_ROW - remainder; i++) {
      padded.push({ id: `pad-${i}`, building_id: '', floor, code: '', status: 'unregistered', merchant_slug: null });
    }
  }

  return (
    <div>
      <div className="dash-h" style={{ fontSize: 17 }}>Floor map · tap a stall to view the trader</div>
      <div className="bldg-floor-tabs" role="tablist" aria-label="Floors">
        {floors.map((f) => (
          <button key={f} className={`bft ${floor === f ? 'on' : ''}`} onClick={() => { setFloor(f); setSelected(null); }} role="tab" aria-selected={floor === f}>
            {f}
          </button>
        ))}
      </div>

      <div className="bldg-stall-grid" style={{ gridTemplateColumns: `repeat(${STALLS_PER_ROW}, 1fr)` }}>
        {padded.map((s) => {
          if (!s.code) return <div key={s.id} aria-hidden="true" />;
          const cls = LEGEND.find((l) => l.key === s.status)?.cls ?? 'bsg-e';
          const label = stallLabel(s);
          return (
            <button
              key={s.id}
              className={`bsg ${cls}`}
              style={selected?.id === s.id ? { outline: '2px solid var(--mint)' } : undefined}
              onClick={() => setSelected(s)}
              aria-label={`Stall ${s.code}${label ? `, ${label}` : ', vacant'}`}
              title={s.merchant_slug ? bySlug.get(s.merchant_slug)?.business_name : 'Vacant'}
            >
              <div className="bsg-id">{s.code}</div>
              {label && <div className="bsg-nm">{label}</div>}
            </button>
          );
        })}
      </div>

      <div className="bldg-legend">
        {LEGEND.map((l) => (
          <span key={l.key}><span className={`bl-dot ${l.cls}`} style={{ border: '1px solid rgba(0,0,0,0.08)' }} />{l.label}</span>
        ))}
      </div>

      {selected && (
        <div className="res-card" style={{ marginTop: 16 }}>
          {selected.merchant_slug && bySlug.has(selected.merchant_slug) ? (
            <>
              <div className="rc-top">
                <span className="rc-av" style={{ background: '#691460' }}>
                  {bySlug.get(selected.merchant_slug)!.avatar_url ? (
                    <img src={bySlug.get(selected.merchant_slug)!.avatar_url!} alt="" width={48} height={48} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    selected.merchant_slug.slice(0, 2).toUpperCase()
                  )}
                </span>
                <span className="rc-info">
                  <span className="rc-name">{bySlug.get(selected.merchant_slug)!.business_name}</span>
                  <span className="rc-sub" style={{ display: 'block' }}>
                    {bySlug.get(selected.merchant_slug)!.category} · Stall {selected.code}
                  </span>
                </span>
              </div>
              <Link href={`/m/${selected.merchant_slug}`} className="rc-btn" style={{ display: 'block', textAlign: 'center' }}>
                Open trust profile →
              </Link>
            </>
          ) : (
            <>
              <div className="rc-name" style={{ marginBottom: 4 }}>Stall {selected.code} · vacant</div>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 12 }}>
                Nobody has claimed this stall yet. Agents onboarding this building can register the
                stall owner from the landlord dashboard.
              </p>
              <Link href="/landlord" className="rc-btn" style={{ display: 'block', textAlign: 'center', background: 'var(--mint-dark)' }}>
                Register this stall →
              </Link>
            </>
          )}
        </div>
      )}

      {merchantsHere.length > 0 && floorStalls.length > 0 && (
        <>
          <div className="dash-h" style={{ marginTop: 28 }}>Traders on this floor</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {merchantsHere.map((m) => (
              <Link key={m.id} href={`/m/${m.slug}`} className="bml-item">
                <span className="bml-av" style={{ background: '#0a1534' }}>
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt={m.business_name} width={40} height={40} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    m.business_name.slice(0, 2).toUpperCase()
                  )}
                </span>
                <div className="bml-info">
                  <div className="bml-name">{m.business_name}</div>
                  <div className="bml-sub">{m.category}</div>
                </div>
                <div className="bml-stars">{Number(m.rating_avg).toFixed(1)}★</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
