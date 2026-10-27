// Landlord actions are always scoped to the authenticated landlord's own building.
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hasSupabase, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function jsonError(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'landlord' || !session.landlordId) {
    return jsonError('Sign in as a landlord to manage your building', 401);
  }
  if (!hasSupabase) return jsonError('Database not configured', 503);

  const body = await req.json().catch(() => null);
  const action = String(body?.action ?? '');
  const building = String(body?.building ?? '').trim();
  if (!building) return jsonError('Building is required', 400);

  try {
    const db = supabase();
    const { data: account, error: accountError } = await db
      .from('landlord_accounts')
      .select('id, name')
      .eq('id', session.landlordId)
      .maybeSingle();
    if (accountError) return jsonError('Could not verify building access', 500);
    if (!account || account.name.trim().toLowerCase() !== building.toLowerCase()) {
      return jsonError('You can only manage the building assigned to your landlord account', 403);
    }

    if (action === 'admit') {
      const name = String(body?.name ?? '').trim().slice(0, 200);
      const phone = String(body?.phone ?? '').trim().slice(0, 40);
      const stall = String(body?.stall ?? '').trim().slice(0, 120);
      const category = String(body?.category ?? '').trim().slice(0, 80);
      if (!name || !phone || !stall || !category) {
        return jsonError('Seller name, phone, category and stall are required', 400);
      }
      if (!/^(?:0\\d{9}|\\+?254\\d{9})$/.test(phone.replace(/[\\s()-]/g, ''))) {
        return jsonError('Enter a valid Kenyan seller phone number', 400);
      }

      const { data: existing, error: existingError } = await db.from('merchants')
        .select('id, slug, building_name')
        .ilike('business_name', name).limit(2);
      if (existingError) return jsonError('Could not look up seller', 500);
      const sameBuilding = (existing ?? []).find((m) =>
        String(m.building_name ?? '').trim().toLowerCase() === building.toLowerCase()
      );
      if (!sameBuilding && (existing ?? []).length) {
        return jsonError('A seller with this name is already attached to another building. Verify the existing record instead.', 409);
      }

      const { data: b, error: buildingError } = await db.from('buildings')
        .select('id').ilike('name', building).limit(1).maybeSingle();
      if (buildingError) return jsonError('Could not look up building', 500);

      if (sameBuilding?.id) {
        const { error } = await db.from('merchants').update({
          phone, whatsapp: phone, category, building_name: building,
          building_id: b?.id ?? null, stall_label: stall, ll_phone_verified: true,
          verified: 'verified', is_demo: false,
        }).eq('id', sameBuilding.id);
        if (error) return jsonError('Could not admit seller', 500);
        return NextResponse.json({ ok: true, slug: sameBuilding.slug, merchantId: sameBuilding.id });
      }

      const slug = `seller-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const { data: created, error } = await db.from('merchants').insert({
        slug, business_name: name, owner_name: name, phone, whatsapp: phone,
        category, building_name: building, building_id: b?.id ?? null,
        stall_label: stall, ll_phone_verified: true, verified: 'verified',
        claimed: false, is_demo: false,
      }).select('id, slug').single();
      if (error) return jsonError('Could not admit seller', 500);
      return NextResponse.json({ ok: true, slug: created.slug, merchantId: created.id });
    }

    if (action === 'verify' || action === 'revoke') {
      const name = String(body?.name ?? '').trim().slice(0, 200);
      if (!name) return jsonError('Seller name is required', 400);
      const verified = action === 'verify';

      const [businessResult, ownerResult] = await Promise.all([
        db.from('claims').update({ verified }).eq('building_name', account.name).eq('business_name', name),
        db.from('claims').update({ verified }).eq('building_name', account.name).eq('owner_name', name),
      ]);
      if (businessResult.error || ownerResult.error) return jsonError('Could not update seller verification', 500);

      const { error: merchantError } = await db.from('merchants')
        .update({ ll_phone_verified: verified, verified: verified ? 'verified' : 'basic' })
        .eq('building_name', account.name)
        .eq('business_name', name);
      if (merchantError) return jsonError('Could not update seller verification', 500);
      return NextResponse.json({ ok: true, verified });
    }

    if (action === 'vacate') {
      const name = String(body?.name ?? '').trim().slice(0, 200);
      if (!name) return jsonError('Seller name is required', 400);

      const { data: seller, error: sellerError } = await db.from('merchants')
        .select('phone, stall_label')
        .eq('building_name', account.name)
        .eq('business_name', name)
        .maybeSingle();
      if (sellerError) return jsonError('Could not look up seller', 500);
      if (!seller) return jsonError('Seller not found in your building', 404);

      const { error: historyError } = await db.from('vacated_traders').insert({
        building_name: account.name,
        name,
        phone: seller.phone ?? null,
        sub: String(body?.sub ?? seller.stall_label ?? '').slice(0, 200) || null,
        initials: String(body?.initials ?? '').slice(0, 10) || null,
        color: String(body?.color ?? '').slice(0, 40) || null,
      });
      if (historyError) return jsonError('Could not record vacated seller', 500);

      const { error } = await db.from('merchants').update({
        building_name: null, building_id: null, stall_label: null,
        ll_phone_verified: false, verified: 'basic',
      }).eq('building_name', account.name).eq('business_name', name);
      if (error) return jsonError('Could not vacate seller', 500);
      return NextResponse.json({ ok: true });
    }

    return jsonError('Unknown action', 400);
  } catch {
    return jsonError('Could not complete landlord action', 500);
  }
}
