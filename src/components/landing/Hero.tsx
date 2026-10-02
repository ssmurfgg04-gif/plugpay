'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { PlatformStats, SearchResult } from '@/lib/types';
import { formatKsh } from '@/lib/format';

function MerchantCard({ r }: { r: SearchResult }) {
  const hue = r.hue;
  return (
    <Link href={`/m/${r.slug}`} className="res-card">
      <div className="rc-top">
        <span className="rc-av" style={{ background: `linear-gradient(135deg, hsl(${hue} 45% 38%), hsl(${(hue + 40) % 360} 50% 30%))` }}>
          {r.avatar_url ? (
            <img src={r.avatar_url} alt={r.name} width={48} height={48} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            r.initials
          )}
        </span>
        <span className="rc-info">
          <span className="rc-name">{r.name}</span>
          <span className="rc-sub" style={{ display: 'block' }}>{r.subtitle}</span>
          <span className={`rc-badge ${r.badge === 'Trusted' ? 'rcb-v' : 'rcb-b'}`}>
            {r.badge === 'Trusted' ? '✓ Trusted seller' : r.badge === 'Verified' ? '✓ ID verified' : '○ Registered'}
          </span>
        </span>
      </div>
      <div className="rc-stats">
        <div className="rcs"><div className="rcs-n">{r.rating.toFixed(1)}★</div><div className="rcs-l">Rating</div></div>
        <div className="rcs"><div className="rcs-n">{r.sales}</div><div className="rcs-l">Sales</div></div>
        <div className="rcs"><div className="rcs-n">{r.subtitle.split('·')[0].trim().split(' ').slice(-1)[0]}</div><div className="rcs-l">Stall</div></div>
      </div>
      <span className="rc-btn" style={{ display: 'block', textAlign: 'center' }}>View trust profile</span>
    </Link>
  );
}

function BuildingCard({ r }: { r: SearchResult }) {
  const hue = r.hue;
  return (
    <Link href={`/buildings/${r.slug}`} className="res-card">
      <div className="rc-top">
        <span className="rc-av" style={{ borderRadius: 8, background: `linear-gradient(135deg, hsl(${hue} 40% 30%), hsl(${(hue + 30) % 360} 45% 22%))` }}>🏢</span>
        <span className="rc-info">
          <span className="rc-name">{r.name}</span>
          <span className="rc-sub" style={{ display: 'block' }}>{r.subtitle}</span>
          <span className="rc-badge rcb-b">✓ Verified building</span>
        </span>
      </div>
      <div className="rc-stats">
        <div className="rcs"><div className="rcs-n">{r.stalls}</div><div className="rcs-l">Stalls</div></div>
        <div className="rcs"><div className="rcs-n">{r.coverage}%</div><div className="rcs-l">Registered</div></div>
        <div className="rcs"><div className="rcs-n">{r.rating.toFixed(1)}★</div><div className="rcs-l">Avg</div></div>
      </div>
      <span className="rc-btn" style={{ display: 'block', textAlign: 'center' }}>Open floor map</span>
    </Link>
  );
}

export function Hero({ stats }: { stats: PlatformStats }) {
  const [tab, setTab] = useState<'merchant' | 'building'>('merchant');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'merchant' | 'building'>('all');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  async function doSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setShowMore(false);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = (results ?? []).filter((r) => filter === 'all' || r.type === filter);
  const visible = showMore ? filtered : filtered.slice(0, 4);

  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hero-badge">
          <span className="hero-dots" aria-hidden="true">
            <span style={{ background: '#e557d6' }}>W</span>
            <span style={{ background: '#691460' }}>A</span>
            <span style={{ background: '#2b8a6e' }}>G</span>
          </span>
          <b>{stats.verified_merchants.toLocaleString('en-KE')}+ traders live in Nairobi CBD</b>
        </div>

        <h1>The trust layer for <em>Kenya&apos;s</em> WhatsApp commerce.</h1>
        <p className="hero-p">
          PlugPay verifies every seller from commercial buildings, anchors every sale to a real
          receipt, and turns your WhatsApp chat into a storefront buyers can actually trust.
          No app, no upfront risk.
        </p>

        <div className="hero-search-wrap">
          <div className="hero-search-box">
            <div className="hsb-tabs" role="tablist" aria-label="Search type">
              <button role="tab" aria-selected={tab === 'merchant'} className={`hsb-tab ${tab === 'merchant' ? 'on' : ''}`} onClick={() => setTab('merchant')}>
                Find a merchant
              </button>
              <button role="tab" aria-selected={tab === 'building'} className={`hsb-tab ${tab === 'building' ? 'on' : ''}`} onClick={() => setTab('building')}>
                Find a building
              </button>
            </div>
            <form
              className="hsb-input-row"
              onSubmit={(e) => { e.preventDefault(); doSearch(query); }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a8ca0" strokeWidth="2.2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tab === 'merchant' ? 'Try "electronics" or "Wanjiku"' : 'Try "Anniversary Towers"'}
                aria-label={tab === 'merchant' ? 'Search merchants' : 'Search buildings'}
              />
              <button type="submit" className="hsb-btn">Search →</button>
            </form>
          </div>

          {loading && (
            <div className="results-section" ref={resultsRef}>
              <div className="results-inner">
                <div className="skel" style={{ height: 20, width: '40%', marginBottom: 14 }} />
                {[0, 1].map((i) => <div key={i} className="skel" style={{ height: 96, marginBottom: 10 }} />)}
              </div>
            </div>
          )}

          {!loading && results && (
            <div className="results-section" ref={resultsRef}>
              <div className="results-inner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div className="results-title">Search results</div>
                    <div className="results-meta">Showing top matches for &quot;{query}&quot;</div>
                  </div>
                </div>
                <div className="results-filters">
                  {(['all', 'merchant', 'building'] as const).map((f) => (
                    <button key={f} className={`rf ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
                      {f === 'all' ? 'All' : f === 'merchant' ? 'Merchants' : 'Buildings'}
                    </button>
                  ))}
                </div>
                {filtered.length === 0 ? (
                  <div style={{ padding: '24px 8px', textAlign: 'center', color: 'var(--muted)', fontSize: 13, lineHeight: 1.7 }}>
                    Nothing matched yet. Try a category like &quot;fashion&quot;, or browse the
                    <Link href="/buildings" style={{ color: 'var(--red)', fontWeight: 700 }}> building directory</Link>.
                  </div>
                ) : (
                  <div className="results-grid">
                    {visible.map((r) =>
                      r.type === 'merchant'
                        ? <MerchantCard key={`${r.type}-${r.slug}`} r={r} />
                        : <BuildingCard key={`${r.type}-${r.slug}`} r={r} />,
                    )}
                  </div>
                )}
                {filtered.length > 4 && !showMore && (
                  <button onClick={() => setShowMore(true)} className="rc-btn" style={{ marginTop: 12, background: '#fff', color: 'var(--ink)', border: '1.5px solid var(--border)' }}>
                    Show more results →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hero-stats">
          <div className="hstat"><div className="hstat-n">{stats.verified_merchants}</div><div className="hstat-l">Verified merchants</div></div>
          <div className="hstat"><div className="hstat-n">{stats.buildings_mapped}</div><div className="hstat-l">Buildings mapped</div></div>
          <div className="hstat"><div className="hstat-n">{stats.avg_rating.toFixed(1)}★</div><div className="hstat-l">Avg merchant rating</div></div>
          <div className="hstat"><div className="hstat-n">{formatKsh(stats.gmv_month_kes).replace('KSh ', 'KSh')}</div><div className="hstat-l">Platform GMV/month</div></div>
        </div>
      </div>
    </section>
  );
}
