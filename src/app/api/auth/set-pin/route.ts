// POST /api/auth/set-pin — set a 6-digit PIN after OTP verification. Body: { email, token, pin }
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { normalizeEmail, hashPassword, serializeSession, sessionCookieOptions, SESSION_COOKIE } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = normalizeEmail(String(body?.email ?? ''));
  const token = String(body?.token ?? '').trim();
  const pin = String(body?.pin ?? '').trim();
  if (!email || !token || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid 6-digit PIN' }, { status: 400 });
  }

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  const db = supabase();

  const { data: row } = await db.from('otp_codes').select('id, code_hash, used').eq('email', email).eq('used', true)
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!row || !String(row.code_hash).endsWith('$' + token)) {
    return NextResponse.json({ ok: false, error: 'Verification expired. Request a new code.' }, { status: 401 });
  }

  // Upsert app_users with pin_hash (reuse password_hash column for the PIN).
  const { data: existing } = await db.from('app_users').select('id, role, merchant_slug, landlord_id').eq('email', email).maybeSingle();
  let userId: string, role = 'landlord', merchantSlug: string | null = null, landlordId: string | null = null;

  if (existing?.id) {
    userId = existing.id;
    role = existing.role;
    merchantSlug = existing.merchant_slug;
    landlordId = existing.landlord_id;
    await db.from('app_users').update({ password_hash: hashPassword(pin) }).eq('id', userId);
  } else {
    // Create landlord account + app_user.
    const { data: ll } = await db.from('landlord_accounts').insert({ client_id: `ll-${Date.now().toString(36)}`, name: email.split('@')[0], owner_email: email }).select('id').single();
    if (ll?.id) landlordId = ll.id;
    const { data: u, error } = await db.from('app_users').insert({ email, password_hash: hashPassword(pin), role: 'landlord', landlord_id: landlordId }).select('id').single();
    if (error || !u?.id) return NextResponse.json({ ok: false, error: 'Could not create account' }, { status: 500 });
    userId = u.id;
  }

  const res = NextResponse.json({ ok: true, role, merchantSlug, email });
  res.cookies.set(SESSION_COOKIE, serializeSession({ userId, email, role: role as 'trader' | 'landlord' | 'agent' | 'admin', merchantSlug, landlordId, iat: Date.now() }), sessionCookieOptions());
  return res;
}
