// POST /api/claims - mirror of the agent portal claim actions.
// Body: { action: 'upsert' | 'send' | 'claimed', claim: {...} }
// Best-effort persistence: the UI keeps working locally even if this fails.

import { NextRequest, NextResponse } from 'next/server';
import { hasSupabase, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!hasSupabase) return NextResponse.json({ ok: false, claims: [] });
  try {
    const { data } = await supabase().from('claims').select('*').order('created_at', { ascending: false });
    return NextResponse.json({ ok: true, claims: data ?? [] });
  } catch {
    return NextResponse.json({ ok: false, claims: [] });
  }
}

export async function POST(req: NextRequest) {
  if (!hasSupabase) return NextResponse.json({ ok: false });
  const body = await req.json().catch(() => null);
  const c = body?.claim;
  if (!c) return NextResponse.json({ ok: false, error: 'Missing claim' }, { status: 400 });

  const row = {
    client_id: String(c.id ?? c.token ?? '').slice(0, 120) || null,
    token: String(c.token ?? '').slice(0, 120) || `clm-${Date.now().toString(36)}`,
    business_name: String(c.businessName ?? '').slice(0, 200) || null,
    owner_name: String(c.ownerName ?? '').slice(0, 200) || null,
    phone: String(c.phone ?? '').slice(0, 40) || null,
    category: String(c.category ?? '').slice(0, 80) || null,
    floor: String(c.floor ?? '').slice(0, 20) || null,
    number: String(c.number ?? '').slice(0, 20) || null,
    loc: String(c.loc ?? '').slice(0, 120) || null,
    building_name: String(c.buildingName ?? '').slice(0, 200) || null,
    status: c.status === 'CLAIMED' ? 'CLAIMED' : 'INVITED',
    verified: !!c.verified,
    source: c.source === 'landlord' ? 'landlord' : 'agent',
    draft: !!c.draft,
    sent_at: c.sentAt ? new Date(String(c.sentAt)).toISOString() : new Date().toISOString(),
    claimed_at: c.claimedAt ? new Date(String(c.claimedAt)).toISOString() : null,
  };

  try {
    const { error } = await supabase()
      .from('claims')
      .upsert(row, { onConflict: 'token' });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
