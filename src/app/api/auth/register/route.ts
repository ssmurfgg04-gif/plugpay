// POST /api/auth/register — create a portal account with email + password.
// Body: { email, password, role: 'trader' | 'landlord' | 'agent', businessName?, ownerName? }
//
// A brand-new account is a CLEAN account: a trader gets a fresh merchant row
// (is_demo: false, claimed: true) with an empty catalogue, zero sales and no
// reviews. Nothing demo is attached to the user, ever.

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  EMAIL_RE,
  PortalRole,
  hashPassword,
  isAdminEmail,
  normalizeEmail,
  serializeSession,
  sessionCookieOptions,
  SESSION_COOKIE,
} from '@/lib/session';
import { limitAuth } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

function slugify(prefix: string): string {
  const rand = crypto.randomBytes(6).toString('base64url').slice(0, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

const ROLES: PortalRole[] = ['trader', 'landlord', 'agent', 'admin'];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = normalizeEmail(String(body?.email ?? ''));
  const password = String(body?.password ?? '');
  const role = (ROLES.includes(String(body?.role) as PortalRole) ? (String(body?.role) as PortalRole) : 'trader');
  const businessName = String(body?.businessName ?? '').trim().slice(0, 120);
  const ownerName = String(body?.ownerName ?? '').trim().slice(0, 120);
  const phone = String(body?.phone ?? '').trim().slice(0, 40);

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email address' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: 'Password must be at least 8 characters' }, { status: 400 });
  }
  if (role === 'admin') {
    const adminCode = String(body?.adminCode ?? '').trim();
    const expected = process.env.ADMIN_CODE || '';
    if (!expected) return NextResponse.json({ ok: false, error: 'Admin registration is disabled' }, { status: 503 });
    if (!adminCode || adminCode !== expected) {
      return NextResponse.json({ ok: false, error: 'Invalid admin code' }, { status: 403 });
    }
  }

  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const { ok: rateOk } = limitAuth('register', clientIP, 60, 60_000);
  if (!rateOk) {
    return NextResponse.json({ ok: false, error: 'Too many sign-ups from this address. Try again in a minute.' }, { status: 429 });
  }
  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) {
    return NextResponse.json({ ok: false, error: 'Database not configured. Try again shortly.' }, { status: 503 });
  }

  try {
    const db = supabase();

    const { data: existing } = await db
      .from('app_users')
      .select('id, role, merchant_slug, landlord_id')
      .eq('email', email)
      .maybeSingle();

    if (existing?.id) {
      return NextResponse.json(
        { ok: false, error: 'That email is already registered. Sign in instead.' },
        { status: 409 },
      );
    }

    // Role shells -----------------------------------------------------------
    let merchantSlug: string | null = null;
    let landlordId: string | null = null;

    if (role === 'trader') {
      const fallbackName = businessName || ownerName || email.split('@')[0] || 'My business';
      const { data: merchant, error: mErr } = await db
        .from('merchants')
        .insert({
          slug: slugify('seller'),
          business_name: fallbackName,
          owner_name: ownerName || fallbackName,
          category: 'Other',
          email,
          verified: 'basic',
          claimed: true,
          is_demo: false,
        })
        .select('slug')
        .single();
      if (mErr || !merchant?.slug) {
        return NextResponse.json({ ok: false, error: 'Could not create your seller profile. Try again.' }, { status: 500 });
      }
      merchantSlug = merchant.slug;
    }

    if (role === 'landlord') {
      const name = businessName || ownerName || email.split('@')[0];
      const { data: landlord, error: lErr } = await db
        .from('landlord_accounts')
        .insert({
          client_id: slugify('ll'),
          name: name.slice(0, 80),
          owner_email: email,
        })
        .select('id')
        .single();
      if (!lErr && landlord?.id) landlordId = landlord.id;
    }

    const { data: user, error: uErr } = await db
      .from('app_users')
      .insert({
        email,
        password_hash: hashPassword(password),
        role,
        merchant_slug: merchantSlug,
        landlord_id: landlordId,
      })
      .select('id, role, merchant_slug, landlord_id')
      .single();

    if (uErr || !user?.id) {
      return NextResponse.json({ ok: false, error: 'Could not create the account. Try again.' }, { status: 500 });
    }
    // Best-effort: store phone + agent approval status if those columns exist.
    try {
      await db.from('app_users').update({ phone: phone || null, status: role === 'agent' ? 'pending' : 'active' }).eq('id', user.id);
    } catch {
      // columns may not exist yet (migration 0011)
    }

    const effRole = role === 'admin' || isAdminEmail(email) ? 'admin' : role;
    await logAudit('register', user.id, { email, role });
    const res = NextResponse.json({
      ok: true,
      created: true,
      role: effRole,
      merchantSlug,
      email,
    });
    res.cookies.set(
      SESSION_COOKIE,
      serializeSession({
        userId: user.id,
        email,
        role: effRole,
        merchantSlug,
        landlordId,
        iat: Date.now(),
        maxAge: effRole === 'admin' ? 60 * 60 * 24 * 30 : 60 * 60 * 4,
        adminOverride: effRole === 'admin',
      }),
      sessionCookieOptions(),
    );
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/duplicate key/i.test(msg)) {
      return NextResponse.json({ ok: false, error: 'That email is already registered. Sign in instead.' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: 'Registration failed. Try again.' }, { status: 500 });
  }
}
