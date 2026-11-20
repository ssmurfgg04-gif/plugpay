// POST /api/auth/request-otp — send a 6-digit OTP to an email (landlord flow).
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { normalizeEmail } from '@/lib/session';
import { limitAuth as rl } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function hashCode(code: string, salt: string): string {
  return crypto.createHash('sha256').update(code + salt).digest('hex');
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = normalizeEmail(String(body?.email ?? ''));
  const role = String(body?.role ?? 'landlord');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email address' }, { status: 400 });
  }

  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const { ok: rlOk } = rl('request-otp', clientIP, 5, 60_000);
  if (!rlOk) return NextResponse.json({ ok: false, error: 'Too many requests. Try again in a minute.' }, { status: 429 });

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  const db = supabase();

  // Invalidate prior unused codes for this email.
  await db.from('otp_codes').update({ used: true }).eq('email', email).eq('used', false);

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const salt = crypto.randomBytes(8).toString('hex');
  const codeHash = hashCode(code, salt);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error } = await db.from('otp_codes').insert({
    email, role, code_hash: `${salt}$${codeHash}`, expires_at: expiresAt, attempts: 0, used: false,
  });
  if (error) return NextResponse.json({ ok: false, error: 'Could not create OTP' }, { status: 500 });

  // Send via Resend if configured.
  const resendKey = process.env.RESEND_API_KEY || '';
  if (resendKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'PlugPay <noreply@plugpay.co.ke>',
          to: [email],
          subject: 'Your PlugPay verification code',
          html: `<p>Your PlugPay verification code is <strong>${code}</strong>. It expires in 5 minutes.</p>`,
        }),
      });
    } catch {
      // fall through; code still returned in dev
    }
  }

  const devPayload = process.env.NODE_ENV !== 'production' ? { code } : {};
  return NextResponse.json({ ok: true, message: 'OTP sent', ...devPayload });
}
