// POST /api/landlord - mirror of the landlord portal actions.
// Body: { action: 'admit' | 'verify' | 'revoke' | 'vacate', ... }
// Best-effort persistence so the portal keeps working offline.

import { NextRequest, NextResponse } from 'next/server';
import { hasSupabase, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!hasSupabase) return NextResponse.json({ ok: false });
  const body = await req.json().catch(() => null);
  const action = String(body?.action ?? '');

  try {
    if (action === 'admit') {
      // A landlord admits a seller into a vacant stall: record the stall as
      // occupied by that trader (creates a basic merchant shell if new).
      const name = String(body?.name ?? '').trim();
      const phone = String(body?.phone ?? '').trim();
      const building = String(body?.building ?? '').trim();
      const stall = String(body?.stall ?? '').trim();
      if (!name || !building) return NextResponse.json({ ok: false }, { status: 200 });

      const digits = phone.replace(/\D/g, '').slice(-9);
      const slug = digits
        ? `trader-${digits}-${Date.now().toString(36)}`
        : `landlord-admit-${Date.now().toString(36)}`;
      const { data: b } = await supabase()
        .from('buildings')
        .select('id')
        .ilike('name', building)
        .limit(1)
        .maybeSingle();

      const { data: existing } = await supabase()
        .from('merchants')
        .select('id')
        .eq('business_name', name)
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        await supabase()
          .from('merchants')
          .update({
            building_name: building,
            building_id: b?.id ?? null,
            stall_label: stall || null,
            verified: 'verified',
          })
          .eq('id', existing.id);
        return NextResponse.json({ ok: true, slug: null, merchantId: existing.id });
      }

      const { data: created, error } = await supabase()
        .from('merchants')
        .insert({
          slug,
          business_name: name,
          owner_name: name,
          phone: phone || null,
          whatsapp: phone || null,
          building_name: building,
          building_id: b?.id ?? null,
          stall_label: stall || null,
          verified: 'verified',
          is_demo: true,
        })
        .select('id')
        .single();
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
      return NextResponse.json({ ok: true, slug, merchantId: created?.id ?? null });
    }

    if (action === 'verify' || action === 'revoke') {
      const name = String(body?.name ?? '').trim();
      if (name) {
        await supabase()
          .from('merchants')
          .update({ ll_phone_verified: action === 'verify' })
          .eq('business_name', name);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'vacate') {
      const name = String(body?.name ?? '').trim();
      const building = String(body?.building ?? '').trim();
      if (name) {
        await supabase().from('vacated_traders').insert({
          building_name: building || 'Unknown',
          name,
          sub: String(body?.sub ?? '') || null,
          initials: String(body?.initials ?? '') || null,
          color: String(body?.color ?? '') || null,
        });
        await supabase()
          .from('merchants')
          .update({ building_name: null, building_id: null, stall_label: null })
          .eq('business_name', name);
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
