// POST /api/auth/login — sign in with email + password.
// Body: { email, password }. The role comes from the stored account.

import { NextRequest, NextResponse } from 'next/server';
import {
  normalizeEmail,
  serializeSession,
  sessionCookieOptions,
  verifyPassword,
  SESSION_COOKIE,
} from '@/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = normalizeEmail(String(body?.email ?? ''));
  const password = String(body?.password ?? '');

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: 'Enter your email and password' }, { status: 400 });
  }

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) {
    return NextResponse.json({ ok: false, error: 'Database not configured. Try again shortly.' }, { status: 503 });
  }

  try {
    const { data: user } = await supabase()
      .from('app_users')
      .select('id, email, password_hash, role, merchant_slug, landlord_id')
      .eq('email', email)
      .maybeSingle();

    if (!user?.id || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ ok: false, error: 'Email or password is incorrect' }, { status: 401 });
    }

    // Keep merchant_slug fresh on the session even if it changed on the row.
    let merchantSlug = user.merchant_slug ?? null;
    let landlordId = user.landlord_id ?? null;
    supabase()
      .from('app_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id)
      .then(() => {}, () => {});

    const res = NextResponse.json({
      ok: true,
      role: user.role,
      merchantSlug,
      email: user.email,
    });
    res.cookies.set(
      SESSION_COOKIE,
      serializeSession({
        userId: user.id,
        email: user.email,
        role: user.role,
        merchantSlug,
        landlordId,
        iat: Date.now(),
      }),
      sessionCookieOptions(),
    );
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: 'Sign-in failed. Try again.' }, { status: 500 });
  }
}
