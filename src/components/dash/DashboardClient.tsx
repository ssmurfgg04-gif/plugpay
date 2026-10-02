'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatKsh } from '@/lib/format';

interface DashMerchant {
  slug: string;
  business_name: string;
  owner_name: string;
  category: string;
  stall_label: string | null;
  building_name: string | null;
  verified: 'trusted' | 'verified' | 'basic';
  trust_score: number;
  sales_count: number;
  rating_count: number;
  rating_avg: number;
  mpesa_paybill: string | null;
  has_pin: boolean;
}

interface SaleItem { name: string; qty: number; price: number }

export function DashboardClient({ merchant }: { merchant: DashMerchant }) {
  const router = useRouter();
  const [items, setItems] = useState<SaleItem[]>([{ name: '', qty: 1, price: 0 }]);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  const [delivery, setDelivery] = useState<'pickup' | 'runner'>('pickup');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ receipt_no: string } | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinMsg, setPinMsg] = useState<string | null>(null);

  const total = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);

  function updateItem(idx: number, field: keyof SaleItem, value: string) {
    setItems((prev) => prev.map((item, i) =>
      i === idx
        ? { ...item, [field]: field === 'name' ? value : Number(value) || 0 }
        : item,
    ));
  }

  async function submitSale() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerName, buyerPhone, mpesaCode, delivery, items }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return setError(data.error ?? 'Could not record the sale');
      setReceipt(data);
    } catch {
      setError('Network error, try again');
    } finally {
      setBusy(false);
    }
  }

  async function savePin() {
    setPinMsg(null);
    if (!/^\d{6}$/.test(pin)) return setPinMsg('PIN is 6 digits');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/set-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      setPinMsg(res.ok && data.ok ? 'PIN saved. Next time, skip the code.' : (data.error ?? 'Could not save PIN'));
      if (res.ok && data.ok) { setPinOpen(false); router.refresh(); }
    } finally {
      setBusy(false);
    }
  }

  if (receipt) {
    return (
      <div className="dash-card" style={{ textAlign: 'center' }}>
        <div className="auth-ico" aria-hidden="true">🧾</div>
        <h2 className="dash-h" style={{ fontSize: 18 }}>Receipt sent!</h2>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.7 }}>
          Sale recorded · anchored to M-Pesa code <strong>{mpesaCode}</strong> · your trust score is updating.
        </p>
        <div style={{ background: '#f7f8fc', borderRadius: 12, padding: 16, textAlign: 'left', marginBottom: 18 }}>
          <div className="info-row" style={{ borderTop: 'none' }}><div className="info-lbl">Receipt #</div><div className="info-val">{receipt.receipt_no}</div></div>
          <div className="info-row"><div className="info-lbl">Seller</div><div className="info-val">{merchant.business_name} · {merchant.stall_label}</div></div>
          <div className="info-row"><div className="info-lbl">Buyer</div><div className="info-val">{buyerName} · {buyerPhone}</div></div>
          {items.filter((i) => i.name).map((i, idx) => (
            <div className="info-row" key={idx}><div className="info-lbl">Item</div><div className="info-val">{i.qty} × {i.name} · {formatKsh(i.qty * i.price)}</div></div>
          ))}
          <div className="info-row"><div className="info-lbl">Total</div><div className="info-val" style={{ color: 'var(--red)' }}>{formatKsh(total)}</div></div>
        </div>
        <button className="pp-btn" onClick={() => { setReceipt(null); setItems([{ name: '', qty: 1, price: 0 }]); setBuyerName(''); setBuyerPhone(''); setMpesaCode(''); }}>
          Record another sale
        </button>
        <p style={{ marginTop: 14, fontSize: 11.5, color: 'var(--muted)' }}>
          In production the receipt also lands on the buyer&apos;s WhatsApp with your profile link.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* profile strip */}
      <div className="dash-card">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: '-0.3px' }}>{merchant.business_name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--fm)', marginTop: 2 }}>
              {merchant.building_name ?? 'No building yet'}{merchant.stall_label ? ` · ${merchant.stall_label}` : ''}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <span className="rc-badge rcb-v">{merchant.verified === 'trusted' ? '✓ Trusted' : merchant.verified === 'verified' ? '✓ Verified' : '○ Registered'}</span>
              {merchant.has_pin && <span className="rc-badge rcb-b">🔑 PIN set</span>}
            </div>
          </div>
          <div style={{ textAlign: 'center', paddingRight: 20, borderRight: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--fh)', fontSize: 26, color: 'var(--mint)' }}>{merchant.trust_score}</div>
            <div className="mp-stat-l">Trust score</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--fh)', fontSize: 26 }}>{merchant.sales_count}</div>
            <div className="mp-stat-l">Sales</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <Link href={`/m/${merchant.slug}`} className="rf" style={{ textDecoration: 'none' }}>View public profile</Link>
          <button className="rf" onClick={() => setPinOpen((v) => !v)}>{merchant.has_pin ? 'Change PIN' : 'Set a 6-digit PIN'}</button>
        </div>
        {pinOpen && (
          <div style={{ marginTop: 14 }}>
            <label className="pp-label" htmlFor="pin">Choose a 6-digit PIN</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input id="pin" className="pp-input" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="••••••" style={{ letterSpacing: 6, maxWidth: 160 }} />
              <button className="pp-btn" style={{ width: 'auto', padding: '0 20px' }} onClick={savePin} disabled={busy}>Save</button>
            </div>
            {pinMsg && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{pinMsg}</p>}
          </div>
        )}
      </div>

      {/* record sale */}
      <div className="dash-card">
        <h2 className="dash-h">Record a sale &amp; send the receipt</h2>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 18 }}>
          Enter what the buyer paid for and the M-Pesa confirmation code from the payment SMS. The
          receipt anchors to that exact code, which is what makes your reviews trustworthy.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label className="pp-label" htmlFor="bn">Buyer name</label>
            <input id="bn" className="pp-input" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Kevin Njoroge" />
          </div>
          <div>
            <label className="pp-label" htmlFor="bp">Buyer phone</label>
            <input id="bp" className="pp-input" inputMode="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} placeholder="0712 345 678" />
          </div>
        </div>

        <label className="pp-label">Items sold</label>
        {items.map((item, idx) => (
          <div className="sale-item-row" key={idx}>
            <input className="pp-input" value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} placeholder={idx === 0 ? 'Samsung Galaxy A15' : 'Item name'} aria-label={`Item ${idx + 1} name`} />
            <input className="pp-input" inputMode="numeric" value={item.qty || ''} onChange={(e) => updateItem(idx, 'qty', e.target.value)} placeholder="Qty" aria-label={`Item ${idx + 1} quantity`} />
            <input className="pp-input" inputMode="numeric" value={item.price || ''} onChange={(e) => updateItem(idx, 'price', e.target.value)} placeholder="KSh" aria-label={`Item ${idx + 1} price`} />
            {items.length > 1 && (
              <button className="rf" onClick={() => setItems((p) => p.filter((_, i) => i !== idx))} aria-label={`Remove item ${idx + 1}`}>✕</button>
            )}
          </div>
        ))}
        <button className="rf" onClick={() => setItems((p) => [...p, { name: '', qty: 1, price: 0 }])}>+ Add another item</button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          <div>
            <label className="pp-label" htmlFor="mp">M-Pesa confirmation code</label>
            <input id="mp" className="pp-input" value={mpesaCode} onChange={(e) => setMpesaCode(e.target.value.toUpperCase())} placeholder="TGH5K9P2Q" style={{ fontFamily: 'var(--fm)' }} />
          </div>
          <div>
            <span className="pp-label">Delivery</span>
            <div className="method-toggle" style={{ marginBottom: 0 }}>
              <button className={`method-btn ${delivery === 'pickup' ? 'on' : ''}`} onClick={() => setDelivery('pickup')}>🧍 Pickup</button>
              <button className={`method-btn ${delivery === 'runner' ? 'on' : ''}`} onClick={() => setDelivery('runner')}>🛵 Runner</button>
            </div>
          </div>
        </div>

        {error && <p style={{ color: '#b3261e', fontSize: 12.5, marginTop: 12 }}>{error}</p>}

        <button className="pp-btn" style={{ marginTop: 18 }} onClick={submitSale} disabled={busy}>
          {busy ? 'Recording…' : `Record sale & send receipt · ${formatKsh(total)}`}
        </button>
      </div>
    </div>
  );
}
