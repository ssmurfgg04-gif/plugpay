// GET  /api/seller/profile — the signed-in seller's merchant profile.
// PATCH /api/seller/profile — update editable fields on the signed-in
// seller's own merchant row. Ownership always comes from the session.

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const EDITABLE = [
  'business_name',
  'owner_name',
  'category',
  'description',
  'bio',
  'about',
  'phone',
  'whatsapp',
  'street',
  'instagram',
  'tiktok',
  'facebook',
  'mpesa_paybill',
  'mpesa_account',
  'opening_hours',
  'established_year',
] as const;

const LEN: Partial<Record<(typeof EDITABLE)[number], number>> = {
  business_name: 120,
  owner_name: 120,
  category: 80,
  description: 400,
  bio: 400,
  about: 2000,
  phone: 40,
  whatsapp: 40,
  street: 120,
  instagram: 80,
  tiktok: 80,
  facebook: 120,
  mpesa_paybill: 40,
  mpesa_account: 40,
  opening_hours: 120,
};

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'trader' || !session.merchantSlug) {
    return NextResponse.json({ ok: false, error: 'Sign in as a seller' }, { status: 401 });
  }
  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  const { data, error } = await supabase()
    .from('merchants')
    .select('*')
    .eq('slug', session.merchantSlug)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ ok: false, error: 'Profile not found' }, { status: 404 });
  return NextResponse.json({ ok: true, seller: data });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'trader' || !session.merchantSlug) {
    return NextResponse.json({ ok: false, error: 'Sign in as a seller' }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'Nothing to update' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  for (const field of EDITABLE) {
    if (body[field] === undefined) continue;
    const raw = field === 'established_year' ? Number(body[field]) : String(body[field]).trim();
    if (field === 'established_year') {
      if (!Number.isFinite(raw) || (raw as number) < 1900 || (raw as number) > 2100) continue;
      patch[field] = Math.trunc(raw as number);
      continue;
    }
    const max = LEN[field] ?? 200;
    const val = String(raw).slice(0, max);
    if (field === 'phone' || field === 'whatsapp') {
      const digits = val.replace(/\D/g, '');
      if (val && !/^(?:0|\+?254)?\d{9}$/.test(digits)) {
        return NextResponse.json(
          { ok: false, error: 'Enter a valid Kenyan number, e.g. 0712 345 678' },
          { status: 400 },
        );
      }
    }
    patch[field] = val;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: 'Nothing to update' }, { status: 400 });
  }

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  const { data, error } = await supabase()
    .from('merchants')
    .update(patch)
    .eq('slug', session.merchantSlug) // ownership guard
    .select('slug, business_name, owner_name, category, bio, about, phone, whatsapp, street, instagram, tiktok, facebook, mpesa_paybill, mpesa_account, established_year')
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, error: 'Profile not found' }, { status: 404 });
  return NextResponse.json({ ok: true, seller: data });
}
