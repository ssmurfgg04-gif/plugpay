'use client';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(''); setMsg('');
    try {
      const r = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const j = await r.json();
      if (!j.ok) setErr(j.error || 'Failed');
      else setMsg(j.message || 'If registered, a reset link has been sent.');
    } catch (e) { setErr('Network error'); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Forgot password</h1>
      <p style={{ color: '#666', fontSize: 14 }}>Enter your email to receive a reset link.</p>
      <form onSubmit={submit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', padding: 10, margin: '12px 0', border: '1px solid #ccc', borderRadius: 6 }} />
        <button type="submit" disabled={busy} style={{ padding: '10px 16px', borderRadius: 6, background: '#1a1a2e', color: '#fff', border: 'none', cursor: 'pointer' }}>{busy ? 'Sending…' : 'Send reset link'}</button>
      </form>
      {msg && <p style={{ color: 'green', marginTop: 12 }}>{msg}</p>}
      {err && <p style={{ color: '#c00', marginTop: 12 }}>{err}</p>}
    </div>
  );
}