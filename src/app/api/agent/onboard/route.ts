import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hasSupabase, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function cleanString(value: unknown, max = 200) {
  return String(value ?? '').trim().slice(0, max);
}

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'agent') {
    return NextResponse.json({ ok: false, error: 'Sign in as an agent to onboard a building' }, { status: 401 });
  }
  if (!hasSupabase) {
    return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const building = body?.building;
  const name = cleanString(building?.name);
  const address = cleanString(building?.address, 300);
  const mapsUrl = cleanString(building?.mapsUrl, 1000);
  const category = cleanString(building?.category, 100);
  const landlordName = cleanString(building?.landlordName, 120);
  const landlordPhone = cleanString(building?.landlordPhone, 40);
  const landlordEmail = cleanString(building?.landlordEmail, 254).toLowerCase();
  const floors = Math.max(0, Math.min(30, Math.trunc(Number(building?.floors) || 0)));
  const floorStalls = building?.floorStalls && typeof building.floorStalls === 'object' ? building.floorStalls : {};
  const totalRequested = Object.values(floorStalls).reduce((sum: number, value) => {
    const n = Math.trunc(Number(value) || 0);
    return sum + Math.max(0, Math.min(500, n));
  }, 0);

  if (!name || name.length < 2) {
    return NextResponse.json({ ok: false, error: 'Enter a valid building name' }, { status: 400 });
  }
  if (!address || address.length < 3) {
    return NextResponse.json({ ok: false, error: 'Enter the building street or location' }, { status: 400 });
  }
  if (floors < 1) return NextResponse.json({ ok: false, error: 'Building must have at least one floor' }, { status: 400 });
  if (totalRequested > 5000) return NextResponse.json({ ok: false, error: 'The building stall count exceeds the 5,000-stall limit' }, { status: 400 });
  if (mapsUrl && !/^https:\/\//i.test(mapsUrl)) {
    return NextResponse.json({ ok: false, error: 'The map link must start with https://' }, { status: 400 });
  }
  if (landlordEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(landlordEmail)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid landlord email address' }, { status: 400 });
  }
  if (landlordPhone && !/^(?:0\d{9}|\+?254\d{9})$/.test(landlordPhone.replace(/[\s()-]/g, ''))) {
    return NextResponse.json({ ok: false, error: 'Enter a valid Kenyan landlord phone number' }, { status: 400 });
  }

  const slug = slugify(name);
  if (!slug) return NextResponse.json({ ok: false, error: 'Building name cannot be used as a public URL' }, { status: 400 });

  try {
    const db = supabase();
    const { data: existing, error: findError } = await db.from('buildings')
      .select('id, source, created_by, registered_merchants')
      .eq('slug', slug)
      .maybeSingle();
    if (findError) return NextResponse.json({ ok: false, error: 'Could not check the building directory' }, { status: 500 });
    if (existing?.source === 'agent' && existing.created_by && existing.created_by !== session.userId) {
      return NextResponse.json({ ok: false, error: 'This building is already managed by another agent' }, { status: 409 });
    }

    const { data: savedBuilding, error: buildingError } = await db.from('buildings').upsert({
      slug,
      name,
      address,
      area: 'Nairobi CBD',
      floors,
      total_stalls: totalRequested,
      registered_merchants: Number(existing?.registered_merchants ?? 0),
      coverage_pct: 0,
      source: 'agent',
      maps_url: mapsUrl || null,
      category: category || null,
      landlord_name: landlordName || null,
      landlord_phone: landlordPhone || null,
      landlord_email: landlordEmail || null,
      created_by: session.userId,
    }, { onConflict: 'slug' }).select('id, slug, name, address, floors, total_stalls').single();
    if (buildingError || !savedBuilding) {
      return NextResponse.json({ ok: false, error: 'Could not save building details. Apply database migration 0008 if not already applied.' }, { status: 500 });
    }

    const { data: currentStalls, error: stallsError } = await db.from('stalls')
      .select('floor, code')
      .eq('building_id', savedBuilding.id);
    if (stallsError) return NextResponse.json({ ok: false, error: 'Building saved, but stall inventory could not be checked' }, { status: 500 });

    const known = new Set((currentStalls ?? []).map((stall) => String(stall.floor) + '::' + String(stall.code)));
    const missing = [];
    for (let floorIndex = 0; floorIndex < floors; floorIndex += 1) {
      const key = floorIndex === 0 ? 'G' : String(floorIndex);
      const floorName = floorIndex === 0 ? 'Ground' : 'Floor ' + floorIndex;
      const count = Math.max(0, Math.min(500, Math.trunc(Number(floorStalls[key]) || 0)));
      for (let n = 1; n <= count; n += 1) {
        const code = (floorIndex === 0 ? 'G' : String(floorIndex)) + '-' + String(n).padStart(2, '0');
        const id = floorName + '::' + code;
        if (!known.has(id)) {
          known.add(id);
          missing.push({
            building_id: savedBuilding.id,
            floor: floorName,
            code,
            status: 'unregistered',
            merchant_slug: null,
          });
        }
      }
    }

    if (missing.length) {
      const { error: insertStallsError } = await db.from('stalls').insert(missing);
      if (insertStallsError) {
        return NextResponse.json({ ok: false, error: 'Building saved, but stall inventory could not be saved' }, { status: 500 });
      }
    }

    const persistedStallCount = (currentStalls?.length ?? 0) + missing.length;
    const persistedTotal = Math.max(totalRequested, persistedStallCount);
    if (persistedTotal !== Number(savedBuilding.total_stalls ?? 0)) {
      const { error: countError } = await db.from('buildings')
        .update({ total_stalls: persistedTotal })
        .eq('id', savedBuilding.id);
      if (countError) {
        return NextResponse.json({ ok: false, error: 'Building saved, but stall count could not be reconciled' }, { status: 500 });
      }
    }

    if (landlordName || landlordPhone || landlordEmail) {
      const { error: landlordError } = await db.from('landlord_accounts').upsert({
        client_id: 'll-' + slug,
        name: name.slice(0, 80),
        street: address,
        total_stalls: totalRequested,
        owner_phone: landlordPhone || null,
        owner_email: landlordEmail || null,
      }, { onConflict: 'name' });
      if (landlordError) {
        return NextResponse.json({ ok: false, error: 'Building saved, but landlord details could not be saved' }, { status: 500 });
      }
    }

    return NextResponse.json({
      ok: true,
      building: {
        id: savedBuilding.id,
        slug: savedBuilding.slug,
        name: savedBuilding.name,
        address: savedBuilding.address,
        floors: savedBuilding.floors,
        stalls: persistedTotal,
      },
      createdStalls: missing.length,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not complete building onboarding' }, { status: 500 });
  }
}
