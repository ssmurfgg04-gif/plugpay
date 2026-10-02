'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Step = 'phone' | 'otp' | 'pin';
type Method = 'otp' | 'pin';

export function SignInClient() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>('otp');
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validPhone(): boolean {
    const d = phone.replace(/\s/g, '');
    return /^(?:\+?254|0)?(7\d{8}|1\d{8})$/.test(d);
  }

  function normalize(): string {
    const d = phone.replace(/\s/g, '').replace(/^\+?254/, '');
    return d.startsWith('0') ? d : `0${d}`;
  }

  async function sendOtp() {
    setError(null);
    if (!validPhone()) return setError('Enter a valid Kenyan number, e.g. 0712 345 678');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return setError(data.error ?? 'Could not send the code');
      setDemoCode(data.demoCode ?? null);
      setStep('otp');
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    setError(null);
    if (!/^\d{6}$/.test(code)) return setError('The code is 6 digits');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalize(), code }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return setError(data.error ?? 'Verification failed');
      router.push('/dashboard');
    } catch {
      setError('Network error. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function pinLogin() {
    setError(null);
    if (!/^\d{6}$/.test(pin)) return setError('Your PIN is 6 digits');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalize(), pin }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return setError(data.error ?? 'PIN login failed');
      router.push('/dashboard');
    } catch {
      setError('Network error. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-ico" aria-hidden="true">💬</div>
      <h1 className="auth-title">{step === 'pin' ? 'Sign in with PIN' : 'Sign in to'}</h1>
      <p className="auth-sub">
        {step === 'phone' && method === 'otp' && 'Enter your WhatsApp number. We will issue a one-time code, no password needed.'}
        {step === 'phone' && method === 'pin' && 'Enter your number and 6-digit PIN to unlock your stall profile.'}
        {step === 'otp' && <>Code issued to <strong>{normalize()}</strong>. In this demo the code appears on screen instead of arriving on WhatsApp.</>}
      </p>

      {step === 'phone' && (
        <>
          <div className="method-toggle">
            <button className={`method-btn ${method === 'otp' ? 'on' : ''}`} onClick={() => setMethod('otp')}>💬 One-time code</button>
            <button className={`method-btn ${method === 'pin' ? 'on' : ''}`} onClick={() => setMethod('pin')}>🔑 6-digit PIN</button>
          </div>
          <label className="pp-label" htmlFor="phone">WhatsApp number</label>
          <div className="phone-wrap">
            <span className="phone-prefix">+254</span>
            <input
              id="phone"
              className="pp-input"
              inputMode="tel"
              placeholder="712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (method === 'otp' ? sendOtp() : pinLogin())}
            />
          </div>
          {error && <p style={{ color: '#b3261e', fontSize: 12.5, marginTop: 10, textAlign: 'center' }}>{error}</p>}
          <button className="pp-btn" style={{ marginTop: 16 }} onClick={method === 'otp' ? sendOtp : pinLogin} disabled={busy}>
            {busy ? 'One moment…' : method === 'otp' ? 'Send code →' : 'Unlock my profile →'}
          </button>
        </>
      )}

      {step === 'otp' && (
        <>
          <label className="pp-label" htmlFor="code">One-time code</label>
          <input
            id="code"
            className="pp-input"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
            style={{ letterSpacing: 8, textAlign: 'center', fontSize: 18, fontWeight: 800 }}
          />
          {error && <p style={{ color: '#b3261e', fontSize: 12.5, marginTop: 10, textAlign: 'center' }}>{error}</p>}
          <button className="pp-btn" style={{ marginTop: 16 }} onClick={verifyOtp} disabled={busy}>
            {busy ? 'Checking…' : 'Verify & open my profile →'}
          </button>
          <button className="method-btn" style={{ width: '100%', marginTop: 10 }} onClick={() => { setStep('phone'); setCode(''); }}>
            ← Change number
          </button>
          <div className="demo-note">
            Demo mode · your code is <strong style={{ color: 'var(--red)' }}>{demoCode}</strong>. It
            expires in 10 minutes. Production dispatches it on WhatsApp with SMS fallback.
          </div>
        </>
      )}

      <p style={{ fontSize: 11.5, color: 'var(--muted)', textAlign: 'center', marginTop: 18, lineHeight: 1.7 }}>
        Your stall was registered by an agent? Claim it with the number on file. Buyers never sign
        up. <Link href="/" style={{ color: 'var(--red)', fontWeight: 700 }}>Back to home</Link>
      </p>
    </div>
  );
}
