'use client';
import { useEffect, useState } from 'react';

interface AdminData {
  ok: boolean;
  stats: { users: number; merchants: number; buildings: number; receipts: number; invoices: number; claims: number; totalSalesKes: number };
  users: Array<{ id: string; email: string; role: string; merchant_slug: string | null; created_at: string }>;
  merchants: Array<{ id: string; slug: string; business_name: string; owner_name: string; email: string; category: string; building_name: string; verified: string; trust_score: number; sales_count: number; claimed: boolean; is_demo: boolean }>;
  buildings: Array<{ id: string; slug: string; name: string; address: string; area: string; total_stalls: number; registered_merchants: number; verified: boolean }>;
  receipts: Array<{ id: string; receipt_no: string; merchant_name: string; buyer_name: string; total_kes: number; mpesa_code: string; status: string; created_at: string }>;
  invoices: Array<{ id: string; token: string; number: string; merchant_name: string; buyer_name: string; total: number; status: string; created_at: string }>;
  claims: Array<{ id: string; token: string; business_name: string; owner_name: string; building_name: string; loc: string; status: string; verified: boolean; created_at: string }>;
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users' | 'merchants' | 'buildings' | 'receipts' | 'invoices' | 'claims'>('overview');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/admin');
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Failed');
      setData(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user and their profile?')) return;
    const r = await fetch('/api/admin', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
    const j = await r.json();
    if (!j.ok) alert(j.error || 'Failed');
    else load();
  };
  const adminAction = async (action: string, slug: string, value?: number) => {
    const r = await fetch('/api/admin/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, slug, value }) });
    const j = await r.json();
    if (!j.ok) alert(j.error || 'Failed');
  };

  if (loading) return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>Loading admin…</div>;
  if (error) return <div style={{ padding: 40, fontFamily: 'sans-serif', color: '#c00' }}>Error: {error} (sign in as an admin first)</div>;
  if (!data) return null;

  const s = data.stats;
  const card = (label: string, value: string | number) => (
    <div style={{ background: '#1a1a2e', color: '#fff', padding: 16, borderRadius: 8, minWidth: 140 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );

  const tabs: Array<typeof tab> = ['overview', 'users', 'merchants', 'buildings', 'receipts', 'invoices', 'claims'];

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 16 }}>PlugPay Admin Portal</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', background: tab === t ? '#1a1a2e' : '#fff', color: tab === t ? '#fff' : '#000', cursor: 'pointer' }}>{t}</button>
        ))}
        <button onClick={load} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Refresh</button>
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {card('Users', s.users)}
          {card('Merchants', s.merchants)}
          {card('Buildings', s.buildings)}
          {card('Receipts', s.receipts)}
          {card('Invoices', s.invoices)}
          {card('Claims', s.claims)}
          {card('Total Sales (KES)', s.totalSalesKes.toLocaleString())}
        </div>
      )}

      {tab === 'users' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#eee' }}><th style={{ textAlign: 'left', padding: 8 }}>Email</th><th style={{ textAlign: 'left', padding: 8 }}>Role</th><th style={{ textAlign: 'left', padding: 8 }}>Merchant</th><th style={{ textAlign: 'left', padding: 8 }}>Created</th><th style={{ padding: 8 }}>Action</th></tr></thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{u.email}</td>
                <td style={{ padding: 8 }}>{u.role}</td>
                <td style={{ padding: 8 }}>{u.merchant_slug ?? '—'}</td>
                <td style={{ padding: 8 }}>{u.created_at?.slice(0, 10)}</td>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  <button onClick={() => deleteUser(u.id)} style={{ color: '#c00', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'merchants' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#eee' }}><th style={{ textAlign: 'left', padding: 8 }}>Business</th><th style={{ textAlign: 'left', padding: 8 }}>Owner</th><th style={{ textAlign: 'left', padding: 8 }}>Email</th><th style={{ textAlign: 'left', padding: 8 }}>Building</th><th style={{ textAlign: 'left', padding: 8 }}>Verified</th><th style={{ textAlign: 'right', padding: 8 }}>Sales</th><th style={{ textAlign: 'right', padding: 8 }}>Trust</th><th style={{ padding: 8 }}>Actions</th></tr></thead>
          <tbody>
            {data.merchants.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{m.business_name}</td>
                <td style={{ padding: 8 }}>{m.owner_name}</td>
                <td style={{ padding: 8 }}>{m.email ?? '—'}</td>
                <td style={{ padding: 8 }}>{m.building_name ?? '—'}</td>
                <td style={{ padding: 8 }}>{m.verified}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{m.sales_count}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{m.trust_score}</td>
                <td style={{ padding: 8, whiteSpace: 'nowrap' }}>
                  <button onClick={() => adminAction('verify_badge', m.slug).then(load)} style={{ marginRight: 4 }}>Verify</button>
                  <button onClick={() => adminAction('revoke_badge', m.slug).then(load)} style={{ marginRight: 4 }}>Revoke</button>
                  <button onClick={() => adminAction('suspend', m.slug).then(load)} style={{ marginRight: 4, color: '#c00' }}>Suspend</button>
                  <button onClick={() => adminAction('restore', m.slug).then(load)} style={{ marginRight: 4 }}>Restore</button>
                  <button onClick={() => { const v = prompt('New trust score (0-100)'); if (v) adminAction('trust_override', m.slug, Number(v)).then(load); }} style={{ marginRight: 4 }}>Trust</button>
                  <button onClick={() => { if (confirm('Vacate this seller?')) adminAction('vacate', m.slug).then(load); }}>Vacate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'buildings' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#eee' }}><th style={{ textAlign: 'left', padding: 8 }}>Name</th><th style={{ textAlign: 'left', padding: 8 }}>Address</th><th style={{ textAlign: 'left', padding: 8 }}>Area</th><th style={{ textAlign: 'right', padding: 8 }}>Stalls</th><th style={{ textAlign: 'right', padding: 8 }}>Registered</th><th style={{ textAlign: 'left', padding: 8 }}>Verified</th></tr></thead>
          <tbody>
            {data.buildings.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{b.name}</td>
                <td style={{ padding: 8 }}>{b.address}</td>
                <td style={{ padding: 8 }}>{b.area}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{b.total_stalls}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{b.registered_merchants}</td>
                <td style={{ padding: 8 }}>{b.verified ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'receipts' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#eee' }}><th style={{ textAlign: 'left', padding: 8 }}>No.</th><th style={{ textAlign: 'left', padding: 8 }}>Merchant</th><th style={{ textAlign: 'left', padding: 8 }}>Buyer</th><th style={{ textAlign: 'right', padding: 8 }}>Total</th><th style={{ textAlign: 'left', padding: 8 }}>M-Pesa</th><th style={{ textAlign: 'left', padding: 8 }}>Status</th><th style={{ textAlign: 'left', padding: 8 }}>Created</th></tr></thead>
          <tbody>
            {data.receipts.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{r.receipt_no}</td>
                <td style={{ padding: 8 }}>{r.merchant_name}</td>
                <td style={{ padding: 8 }}>{r.buyer_name}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{r.total_kes.toLocaleString()}</td>
                <td style={{ padding: 8 }}>{r.mpesa_code}</td>
                <td style={{ padding: 8 }}>{r.status}</td>
                <td style={{ padding: 8 }}>{r.created_at?.slice(0, 16)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'invoices' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#eee' }}><th style={{ textAlign: 'left', padding: 8 }}>Number</th><th style={{ textAlign: 'left', padding: 8 }}>Merchant</th><th style={{ textAlign: 'left', padding: 8 }}>Buyer</th><th style={{ textAlign: 'right', padding: 8 }}>Total</th><th style={{ textAlign: 'left', padding: 8 }}>Status</th><th style={{ textAlign: 'left', padding: 8 }}>Created</th></tr></thead>
          <tbody>
            {data.invoices.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{v.number || v.token}</td>
                <td style={{ padding: 8 }}>{v.merchant_name}</td>
                <td style={{ padding: 8 }}>{v.buyer_name}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{v.total.toLocaleString()}</td>
                <td style={{ padding: 8 }}>{v.status}</td>
                <td style={{ padding: 8 }}>{v.created_at?.slice(0, 16)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'claims' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#eee' }}><th style={{ textAlign: 'left', padding: 8 }}>Business</th><th style={{ textAlign: 'left', padding: 8 }}>Owner</th><th style={{ textAlign: 'left', padding: 8 }}>Building</th><th style={{ textAlign: 'left', padding: 8 }}>Stall</th><th style={{ textAlign: 'left', padding: 8 }}>Status</th><th style={{ textAlign: 'left', padding: 8 }}>Verified</th></tr></thead>
          <tbody>
            {data.claims.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{c.business_name}</td>
                <td style={{ padding: 8 }}>{c.owner_name}</td>
                <td style={{ padding: 8 }}>{c.building_name}</td>
                <td style={{ padding: 8 }}>{c.loc}</td>
                <td style={{ padding: 8 }}>{c.status}</td>
                <td style={{ padding: 8 }}>{c.verified ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}