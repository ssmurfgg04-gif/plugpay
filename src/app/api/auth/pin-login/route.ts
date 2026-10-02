import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, serializeSession, verifyPin } from '@/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const phone = String(body?.phone ?? '').trim();
  const pin = String(body?.pin ?? '').trim();
  if (!/^\d{10}$/.test(phone) || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ ok: false, error: 'Enter your number and 6-digit PIN' }, { status: 400 });
  }

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) {
    return NextResponse.json({ ok: false, error: 'Database not configured in this preview.' }, { status: 503 });
  }

  const { data: merchant } = await supabase()
    .from('merchants')
    .select('slug, pin_hash')
    .eq('phone', phone)
    .maybeSingle();

  if (!merchant?.pin_hash || !verifyPin(pin, phone, merchant.pin_hash)) {
    return NextResponse.json({ ok: false, error: 'PIN does not match. Use OTP instead.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, slug: merchant.slug });
  res.cookies.set(SESSION_COOKIE, serializeSession({ merchantSlug: merchant.slug, phone, role: 'trader', iat: Date.now() }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return res;
}
