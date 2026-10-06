import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, serializeSession, verifyPin } from '@/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const phone = String(body?.phone ?? '').trim();
  const pin = String(body?.pin ?? '').trim();
  const role = String(body?.role ?? 'trader');
  if (!/^\d{10}$/.test(phone) || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ ok: false, error: 'Enter your number and 6-digit PIN' }, { status: 400 });
  }

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) {
    return NextResponse.json({ ok: false, error: 'Database not configured in this preview.' }, { status: 503 });
  }

  if (role === 'landlord') {
    const { data: account } = await supabase()
      .from('landlord_accounts')
      .select('client_id, name, pin_hash, owner_phone')
      .eq('owner_phone', phone)
      .maybeSingle();
    if (!account?.pin_hash || !verifyPin(pin, phone, account.pin_hash)) {
      return NextResponse.json({ ok: false, error: 'PIN does not match. Use the one-time code instead.' }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true, role: 'landlord' });
    res.cookies.set(
      SESSION_COOKIE,
      serializeSession({ merchantSlug: null, phone, role: 'landlord', iat: Date.now() }),
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      },
    );
    return res;
  }

  const digits = phone;
  const alt = `+254 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  const { data: merchant } = await supabase()
    .from('merchants')
    .select('slug, pin_hash')
    .or(`phone.eq.${digits},phone.eq.${alt},phone.eq.+254${digits.slice(1)}`)
    .maybeSingle();

  if (!merchant?.pin_hash || !verifyPin(pin, phone, merchant.pin_hash)) {
    return NextResponse.json({ ok: false, error: 'PIN does not match. Use the one-time code instead.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, slug: merchant.slug, role: 'trader' });
  res.cookies.set(
    SESSION_COOKIE,
    serializeSession({ merchantSlug: merchant.slug, phone, role: 'trader', iat: Date.now() }),
    {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    },
  );
  return res;
}
