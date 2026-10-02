'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Building, Product, Review, Stall } from '@/lib/types';
import { formatKsh, hueFromString, initials, stars, timeAgo } from '@/lib/format';

interface MerchantView {
  id: string;
  slug: string;
  business_name: string;
  owner_name: string;
  category: string;
  description: string | null;
  building_name: string | null;
  stall_label: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  verified: 'trusted' | 'verified' | 'basic';
  verified_date: string | null;
  trust_score: number;
  rating_avg: number;
  rating_count: number;
  sales_count: number;
  followers_count: number;
  vouches_received: number;
  mpesa_paybill: string | null;
  mpesa_account: string | null;
  established_year: number | null;
  opening_hours: string | null;
  instagram: string | null;
  tiktok: string | null;
  facebook: string | null;
  claimed: boolean;
}

interface Neighbour {
  id: string;
  slug: string;
  business_name: string;
  category: string;
  stall_label: string | null;
  avatar_url: string | null;
  rating_avg: number;
}

const HUES = ['#7c5cbf', '#2b6a9e', '#b05a8f', '#3f7d5c', '#a2703a', '#5a6acf', '#b04a4a', '#4a8a9e'];

export function MerchantTabs({
  merchant, products, reviews, building, stalls, neighbours,
}: {
  merchant: MerchantView;
  products: Product[];
  reviews: Review[];
  building: Building | null;
  stalls: Stall[];
  neighbours: Neighbour[];
}) {
  const [tab, setTab] = useState<'profile' | 'catalogue' | 'reviews' | 'building'>('profile');
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const hue = useMemo(() => HUES[hueFromString(merchant.slug) % HUES.length], [merchant.slug]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  function copyLink() {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/m/${merchant.slug}` : '';
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      showToast('Profile link copied');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => showToast('Copy failed, long-press the address bar instead'));
  }

  function waCheckout(p: Product) {
    const text = encodeURIComponent(
      `Hi ${merchant.business_name}, I want to buy: ${p.name} at ${formatKsh(p.price_kes)}. Saw it on your PlugPay profile.`,
    );
    const phone = (merchant.whatsapp ?? merchant.phone ?? '').replace(/\D/g, '').replace(/^0/, '254');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener');
  }

  const dist = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of reviews) counts[5 - r.rating] += 1;
    return counts;
  }, [reviews]);

  const badgeLabel = merchant.verified === 'trusted' ? '✓ Trusted seller' : merchant.verified === 'verified' ? '✓ ID verified' : '○ Registered seller';

  return (
    <>
      {/* dark hero header */}
      <div className="mp-hero">
        <div className="mp-hero-inner wrap-wide">
          <div style={{ marginBottom: 12 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>← All traders</Link>
          </div>
          <div className="mp-top">
            <span className="mp-av">
              {merchant.avatar_url ? (
                <img src={merchant.avatar_url} alt={merchant.business_name} width={72} height={72} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials(merchant.business_name)
              )}
            </span>
            <div className="mp-info">
              <div className="mp-name">{merchant.business_name}</div>
              <div className="mp-biz">{merchant.owner_name} · {merchant.category}</div>
              <div className="mp-badges">
                <span className={`mp-badge ${merchant.verified === 'trusted' ? 'mpb-v' : 'mpb-b'}`}>{badgeLabel}</span>
                {merchant.claimed && <span className="mp-badge mpb-b">✓ Claimed profile</span>}
                {merchant.building_name && <span className="mp-badge mpb-b">🏢 {merchant.building_name}</span>}
              </div>
            </div>
            <div className="mp-rating">
              <div className="mp-rating-big">{Number(merchant.rating_avg).toFixed(1)}</div>
              <div className="mp-stars-row">{stars(Number(merchant.rating_avg))}</div>
              <div className="mp-rev-ct">{merchant.rating_count} reviews</div>
            </div>
          </div>
          <div className="mp-stats">
            <div className="mp-stat"><div className="mp-stat-n">{merchant.sales_count}</div><div className="mp-stat-l">Sales</div></div>
            <div className="mp-stat"><div className="mp-stat-n">{merchant.followers_count}</div><div className="mp-stat-l">Followers</div></div>
            <div className="mp-stat"><div className="mp-stat-n">{merchant.rating_count}</div><div className="mp-stat-l">Reviews</div></div>
            <div className="mp-stat"><div className="mp-stat-n" style={{ color: 'var(--mint)' }}>{merchant.trust_score}</div><div className="mp-stat-l">Trust score</div></div>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="modal-tabs" role="tablist" aria-label="Profile sections">
        {([
          ['profile', 'Profile'],
          ['catalogue', 'Catalogue'],
          ['reviews', `Reviews (${Math.min(reviews.length, merchant.rating_count)})`],
          ['building', 'Building'],
        ] as const).map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} className={`modal-tab ${tab === key ? 'on' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      <div className="wrap" style={{ padding: '24px 20px 64px' }}>
        {tab === 'profile' && (
          <div>
            {merchant.description && (
              <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.7, marginBottom: 20 }}>{merchant.description}</p>
            )}

            <div>
              <div className="info-row" style={{ borderTop: 'none' }}>
                <span className="info-ico">📍</span>
                <div><div className="info-lbl">Location</div><div className="info-val">{merchant.building_name ?? 'Nairobi CBD'}{merchant.stall_label ? `, ${merchant.stall_label}` : ''}</div></div>
              </div>
              <div className="info-row">
                <span className="info-ico">📞</span>
                <div><div className="info-lbl">Phone</div><div className="info-val">{merchant.phone}</div></div>
              </div>
              <div className="info-row">
                <span className="info-ico">🕐</span>
                <div><div className="info-lbl">Opening hours</div><div className="info-val">{merchant.opening_hours ?? 'Ask on WhatsApp'}</div></div>
              </div>
              <div className="info-row">
                <span className="info-ico">📅</span>
                <div><div className="info-lbl">Established</div><div className="info-val">{merchant.established_year}{merchant.established_year ? ` · ${new Date().getFullYear() - merchant.established_year} years in business` : ''}</div></div>
              </div>
            </div>

            {(merchant.instagram || merchant.tiktok || merchant.facebook) && (
              <>
                <div className="dash-h" style={{ marginTop: 28 }}>Social media</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {merchant.instagram && <span className="mp-badge mpb-b">📷 {merchant.instagram}</span>}
                  {merchant.tiktok && <span className="mp-badge mpb-b">🎵 {merchant.tiktok}</span>}
                  {merchant.facebook && <span className="mp-badge mpb-b">f {merchant.facebook}</span>}
                </div>
              </>
            )}

            {merchant.mpesa_paybill && (
              <div style={{ background: '#0a1534', borderRadius: 16, padding: 20, marginTop: 24, color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span>💳</span><strong style={{ fontSize: 14 }}>Payment information · M-Pesa</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div className="mp-stat-l" style={{ marginBottom: 4 }}>PAYBILL / TILL</div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{merchant.mpesa_paybill}</div>
                  </div>
                  {merchant.mpesa_account && (
                    <div>
                      <div className="mp-stat-l" style={{ marginBottom: 4 }}>ACCOUNT</div>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{merchant.mpesa_account}</div>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', marginTop: 12, lineHeight: 1.6 }}>
                  Pay via M-Pesa, then send the confirmation code in your chat. The trader records it
                  and your receipt anchors to that exact code.
                </p>
              </div>
            )}

            <div className="dash-h" style={{ marginTop: 28 }}>Verification documents</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="doc-card"><span>🪪</span><div><div style={{ fontSize: 13, fontWeight: 700 }}>National ID</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>Checked against the national register</div></div><span className="doc-ok">{merchant.verified !== 'basic' ? `✓ Verified ${merchant.verified_date ? timeAgo(merchant.verified_date) : ''}` : 'Pending'}</span></div>
              <div className="doc-card"><span>🤳</span><div><div style={{ fontSize: 13, fontWeight: 700 }}>Selfie face match</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>Liveness check against ID photo</div></div><span className="doc-ok">{merchant.verified !== 'basic' ? '✓ Verified' : 'Pending'}</span></div>
              <div className="doc-card"><span>🏢</span><div><div style={{ fontSize: 13, fontWeight: 700 }}>Stall occupancy</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>Confirmed by the landlord or agent</div></div><span className="doc-ok">{merchant.verified === 'trusted' ? '✓ Landlord confirmed' : 'In review'}</span></div>
            </div>

            <button className="rc-btn" style={{ marginTop: 24 }} onClick={copyLink}>
              {copied ? '✓ Copied' : '🔗 Share profile link'}
            </button>
          </div>
        )}

        {tab === 'catalogue' && (
          <div>
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 12px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 34, marginBottom: 10 }}>📦</div>
                <strong style={{ display: 'block', color: 'var(--ink)', marginBottom: 6 }}>No items listed yet</strong>
                {merchant.claimed
                  ? 'This trader has not added products. Message them on WhatsApp for the day\'s stock.'
                  : 'This stall was registered by an agent but the trader has not claimed it yet. Items appear once they sign in.'}
              </div>
            ) : (
              <div className="cat-grid">
                {products.map((p) => (
                  <div className="cat-item" key={p.id}>
                    <div className="cat-img">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} loading="lazy" width={200} height={110} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 30 }}>🛍️</div>
                      )}
                    </div>
                    <div className="cat-body">
                      <div className="cat-name">{p.name}</div>
                      <div className="cat-price">{formatKsh(p.price_kes)}</div>
                      <div className="cat-stock">{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</div>
                      <button className="cat-buy" onClick={() => waCheckout(p)} disabled={p.stock === 0}>
                        Checkout via WhatsApp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div>
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 12px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 34, marginBottom: 10 }}>⭐</div>
                <strong style={{ display: 'block', color: 'var(--ink)', marginBottom: 6 }}>No reviews yet</strong>
                Reviews here can only come from buyers with a real receipt, so the first one may take a moment.
              </div>
            ) : (
              <>
                <div className="rev-summary">
                  <div>
                    <div className="rev-big-num">{Number(merchant.rating_avg).toFixed(1)}</div>
                    <div className="rev-stars-big">{stars(Number(merchant.rating_avg))}</div>
                    <div className="rev-sub">{merchant.rating_count} reviews · latest {reviews.length} shown</div>
                  </div>
                  <div className="rev-bars" style={{ flex: 1 }}>
                    {[5, 4, 3, 2, 1].map((s, i) => (
                      <div className="rev-bar-row" key={s}>
                        <span className="rev-bar-lbl">{s}</span>
                        <div className="rev-bar-track">
                          <div className="rev-bar-fill" style={{ width: `${dist[i] ? Math.max(8, (dist[i] / reviews.length) * 100) : 3}%` }} />
                        </div>
                        <span className="rev-bar-ct">{dist[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reviews.map((r, i) => (
                    <div className="rev-item" key={r.id}>
                      <div className="rev-item-top">
                        <span className="rev-item-av" style={{ background: HUES[(hueFromString(r.author_name) + i) % HUES.length] }}>
                          {r.author_initials ?? initials(r.author_name)}
                        </span>
                        <div>
                          <div className="rev-item-name">{r.author_name}</div>
                          <div className="rev-item-date">{timeAgo(r.created_at)}</div>
                        </div>
                        <span className="rev-item-stars">{stars(r.rating)}</span>
                      </div>
                      <p className="rev-item-text">{r.body}</p>
                      {r.verified && (
                        <span className="rev-verified">✓ Verified buyer{r.receipt_no ? ` · Receipt ${r.receipt_no}` : ''}</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'building' && (
          <div>
            {building ? (
              <>
                <Link href={`/buildings/${building.slug}`} className="res-card" style={{ display: 'block', marginBottom: 20 }}>
                  <div className="rc-top">
                    <span className="rc-av" style={{ borderRadius: 8, background: 'var(--red)' }}>🏢</span>
                    <span className="rc-info">
                      <span className="rc-name">{building.name}</span>
                      <span className="rc-sub" style={{ display: 'block' }}>{building.address} · {building.area}</span>
                      <span className="rc-badge rcb-v">✓ Verified building</span>
                    </span>
                  </div>
                  <div className="rc-stats">
                    <div className="rcs"><div className="rcs-n">{building.total_stalls}</div><div className="rcs-l">Total stalls</div></div>
                    <div className="rcs"><div className="rcs-n">{building.registered_merchants}</div><div className="rcs-l">Registered</div></div>
                    <div className="rcs"><div className="rcs-n">{Number(building.avg_rating).toFixed(1)}★</div><div className="rcs-l">Avg rating</div></div>
                  </div>
                  <span className="rc-btn" style={{ display: 'block', textAlign: 'center' }}>View full building map →</span>
                </Link>

                <div className="dash-h">Vouch for your neighbours ({merchant.vouches_received} received)</div>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.65 }}>
                  A vouch is a public statement from one verified trader about another. It is the
                  hardest signal to fake on PlugPay, and the one buyers trust most.
                </p>
                {neighbours.length === 0 ? (
                  <div style={{ color: 'var(--muted)', fontSize: 13, padding: '16px 0' }}>
                    No other registered traders in this building yet. Neighbours appear here as they onboard.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {neighbours.map((n) => (
                      <VouchRow key={n.id} n={n} onDone={showToast} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                This trader has not been mapped to a building yet. Agents assign stalls during onboarding.
              </div>
            )}
            {stalls.length > 0 && building && null}
          </div>
        )}
      </div>

      {toast && <div className="pp-toast">{toast}</div>}
    </>
  );
}

function VouchRow({ n, onDone }: { n: Neighbour; onDone: (msg: string) => void }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');

  async function giveVouch() {
    setState('busy');
    // vouches are recorded against the signed-in trader; in the demo we use
    // a same-building neighbour's session scope with explicit consent UI
    try {
      const res = await fetch('/api/vouch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toSlug: n.slug, fromSlug: 'demo-voucher' }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setState('done');
        onDone(`Vouch sent to ${n.business_name}`);
      } else {
        setState('idle');
        onDone(data.error ?? 'Could not send vouch');
      }
    } catch {
      setState('idle');
      onDone('Network error, try again');
    }
  }

  return (
    <div className="bml-item">
      <span className="bml-av" style={{ background: HUES[hueFromString(n.slug) % HUES.length] }}>
        {n.avatar_url ? (
          <img src={n.avatar_url} alt={n.business_name} width={40} height={40} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          initials(n.business_name)
        )}
      </span>
      <div className="bml-info">
        <div className="bml-name">{n.business_name}</div>
        <div className="bml-sub">{n.category} · {n.stall_label}</div>
      </div>
      <div className="bml-right">
        <div className="bml-stars">{Number(n.rating_avg).toFixed(1)}★</div>
        <button
          onClick={giveVouch}
          disabled={state !== 'idle'}
          className="rf"
          style={state === 'done' ? { background: '#f8f1f7', color: 'var(--red)', borderColor: 'rgba(105,20,96,0.3)' } : undefined}
        >
          {state === 'done' ? '✓ Vouched' : state === 'busy' ? '…' : 'Vouch'}
        </button>
      </div>
    </div>
  );
}
