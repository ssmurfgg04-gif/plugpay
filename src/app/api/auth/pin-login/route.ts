// POST /api/auth/pin-login — sign in with email + 6-digit PIN. Body: { email, pin }
import { NextRequest, NextResponse } from 'next/server';
import { normalizeEmail, verifyPassword, serializeSession, sessionCookieOptions, SESSION_COOKIE } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = normalizeEmail(String(body?.email ?? ''));
  const pin = String(body?.pin ?? '').trim();
  if (!email || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ ok: false, error: 'Enter your email and 6-digit PIN' }, { status: 400 });
  }

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });

  const { data: user } = await supabase().from('app_users').select('id, email, password_hash, role, merchant_slug, landlord_id').eq('email', email).maybeSingle();
  if (!user?.id || !verifyPassword(pin, user.password_hash)) {
    return NextResponse.json({ ok: false, error: 'Email or PIN is incorrect' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, role: user.role, merchantSlug: user.merchant_slug, email: user.email });
  res.cookies.set(SESSION_COOKIE, serializeSession({ userId: user.id, email: user.email, role: user.role, merchantSlug: user.merchant_slug, landlordId: user.landlord_id, iat: Date.now() }), sessionCookieOptions());
  return res;
}
