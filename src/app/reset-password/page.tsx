'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(''); setMsg('');
    try {
      const r = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const j = await r.json();
      if (!j.ok) setErr(j.error || 'Failed');
      else { setMsg(j.message || 'Password updated'); setTimeout(() => router.push('/seller'), 1500); }
    } catch (e) { setErr('Network error'); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ maxWidth: 420, margin: '60px auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Reset password</h1>
      {!token && <p style={{ color: '#c00' }}>Missing reset token.</p>}
      <form onSubmit={submit}>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (min 8 chars)" style={{ width: '100%', padding: 10, margin: '12px 0', border: '1px solid #ccc', borderRadius: 6 }} />
        <button type="submit" disabled={busy || !token} style={{ padding: '10px 16px', borderRadius: 6, background: '#1a1a2e', color: '#fff', border: 'none', cursor: 'pointer' }}>{busy ? 'Updating…' : 'Update password'}</button>
      </form>
      {msg && <p style={{ color: 'green', marginTop: 12 }}>{msg}</p>}
      {err && <p style={{ color: '#c00', marginTop: 12 }}>{err}</p>}
    </div>
  );
}