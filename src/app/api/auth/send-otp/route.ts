import { NextRequest, NextResponse } from 'next/server';
import { OTP_COOKIE, serializeOtpCookie } from '@/lib/session';

const KENYAN_PHONE = /^(?:\+?254|0)(7\d{8}|1\d{8})$/;
const ROLES = ['trader', 'landlord', 'agent'];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const raw = String(body?.phone ?? '');
  const role = ROLES.includes(String(body?.role)) ? String(body.role) : 'trader';
  const digits = raw.replace(/\D/g, '');
  if (!KENYAN_PHONE.test(digits)) {
    return NextResponse.json(
      { ok: false, error: 'Enter a valid Kenyan number, e.g. 0712 345 678' },
      { status: 400 },
    );
  }

  const normalized = digits.replace(/^\+?254/, '0');
  const code = String(Math.floor(100000 + Math.random() * 900000));

  try {
    const { hasSupabase, supabase } = await import('@/lib/supabase');
    if (hasSupabase) {
      await supabase().from('otp_codes').upsert({
        phone: normalized,
        code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });
    }
  } catch {
    // DB unreachable: the signed cookie below still carries the code.
  }

  // Demo mode: the OTP is surfaced in the UI instead of a paid WhatsApp/SMS
  // dispatch. A signed httpOnly cookie pairs this browser with the code for
  // 10 minutes so sign-in works even when the database cannot be reached.
  // Production path: Twilio Verify or the Supabase send-SMS hook.
  const res = NextResponse.json({ ok: true, phone: normalized, role, demoCode: code });
  res.cookies.set(OTP_COOKIE, serializeOtpCookie(normalized, code), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60,
    path: '/',
  });
  return res;
}
