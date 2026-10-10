// POST /api/auth/register — create a portal account with email + password.
// Body: { email, password, role: 'trader' | 'landlord' | 'agent', businessName?, ownerName? }
//
// A brand-new account is a CLEAN account: a trader gets a fresh merchant row
// (is_demo: false, claimed: true) with an empty catalogue, zero sales and no
// reviews. Nothing demo is attached to the user, ever.

import { NextRequest, NextResponse } from 'next/server';
import {
  EMAIL_RE,
  PortalRole,
  hashPassword,
  normalizeEmail,
  serializeSession,
  sessionCookieOptions,
  SESSION_COOKIE,
} from '@/lib/session';

const ROLES: PortalRole[] = ['trader', 'landlord', 'agent'];

function slugify(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = normalizeEmail(String(body?.email ?? ''));
  const password = String(body?.password ?? '');
  const role = (ROLES.includes(String(body?.role)) ? String(body.role) : 'trader') as PortalRole;
  const businessName = String(body?.businessName ?? '').trim().slice(0, 120);
  const ownerName = String(body?.ownerName ?? '').trim().slice(0, 120);

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email address' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: 'Password must be at least 8 characters' }, { status: 400 });
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

    const res = NextResponse.json({
      ok: true,
      created: true,
      role,
      merchantSlug,
      email,
    });
    res.cookies.set(
      SESSION_COOKIE,
      serializeSession({
        userId: user.id,
        email,
        role,
        merchantSlug,
        landlordId,
        iat: Date.now(),
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
