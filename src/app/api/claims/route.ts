// Claims API: agent-owned writes, token-scoped public reads, and seller claim completion.
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hasSupabase, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const CLAIM_FIELDS = 'client_id, token, business_name, owner_name, phone, category, floor, number, loc, building_name, status, verified, source, draft, sent_at, claimed_at, created_at';

function toClientClaim(c: Record<string, unknown>) {
  return {
    id: String(c.client_id ?? c.token ?? ''),
    token: String(c.token ?? ''),
    businessName: String(c.business_name ?? ''),
    ownerName: String(c.owner_name ?? ''),
    phone: String(c.phone ?? ''),
    category: String(c.category ?? ''),
    floor: String(c.floor ?? ''),
    number: String(c.number ?? ''),
    loc: String(c.loc ?? ''),
    buildingName: String(c.building_name ?? ''),
    status: String(c.status ?? 'INVITED'),
    verified: !!c.verified,
    source: String(c.source ?? 'agent'),
    draft: !!c.draft,
    sentAt: c.sent_at ? String(c.sent_at) : null,
    claimedAt: c.claimed_at ? String(c.claimed_at) : null,
    createdAt: c.created_at ? String(c.created_at) : null,
  };
}

export async function GET(req: NextRequest) {
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  const token = String(req.nextUrl.searchParams.get('token') ?? '').trim();

  try {
    const db = supabase();
    // A claim URL is a capability link. It may reveal only that one claim, never
    // the complete list of sellers' names and phone numbers.
    if (token) {
      if (token.length > 120) return NextResponse.json({ ok: false, error: 'Invalid claim link' }, { status: 400 });
      const { data, error } = await db.from('claims').select(CLAIM_FIELDS).eq('token', token).maybeSingle();
      if (error) return NextResponse.json({ ok: false, error: 'Could not load claim' }, { status: 500 });
      if (!data || data.draft) return NextResponse.json({ ok: false, error: 'Claim link not found' }, { status: 404 });
      return NextResponse.json({ ok: true, claim: toClientClaim(data as Record<string, unknown>) });
    }

    const session = await getSession();
    if (!session || session.role !== 'agent') {
      return NextResponse.json({ ok: false, error: 'Sign in as an agent' }, { status: 401 });
    }
    const { data, error } = await db.from('claims').select(CLAIM_FIELDS)
      .eq('created_by', session.userId)
      .order('created_at', { ascending: false }).limit(200);
    if (error) return NextResponse.json({ ok: false, error: 'Could not load claims' }, { status: 500 });
    return NextResponse.json({ ok: true, claims: (data ?? []).map((c) => toClientClaim(c as Record<string, unknown>)) });
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not load claims' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: 'Sign in to continue' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const action = String(body?.action ?? 'upsert');

  try {
    const db = supabase();

    if (action === 'claimed') {
      if (session.role !== 'trader' || !session.merchantSlug) {
        return NextResponse.json({ ok: false, error: 'Sign in as a seller to claim this stall' }, { status: 403 });
      }
      const token = String(body?.token ?? '').trim();
      if (!token || token.length > 120) return NextResponse.json({ ok: false, error: 'Invalid claim link' }, { status: 400 });

      const { data: claim, error: claimError } = await db.from('claims')
        .select(CLAIM_FIELDS).eq('token', token).maybeSingle();
      if (claimError) return NextResponse.json({ ok: false, error: 'Could not load claim' }, { status: 500 });
      if (!claim || claim.draft) return NextResponse.json({ ok: false, error: 'Claim link not found' }, { status: 404 });
      if (claim.status === 'CLAIMED') {
        return NextResponse.json({ ok: false, error: 'This claim link has already been used. Contact your agent if you need help.' }, { status: 409 });
      }

      // Reserve the one-time claim before changing the seller record. The
      // conditional update prevents two accounts claiming the same invite.
      const now = new Date().toISOString();
      const { data: reserved, error: reserveError } = await db.from('claims')
        .update({ status: 'CLAIMED', claimed_at: now })
        .eq('token', token).eq('status', 'INVITED').eq('draft', false)
        .select('token').maybeSingle();
      if (reserveError) return NextResponse.json({ ok: false, error: 'Could not complete claim' }, { status: 500 });
      if (!reserved) return NextResponse.json({ ok: false, error: 'This claim link has already been used. Contact your agent if you need help.' }, { status: 409 });

      const { data: seller, error: sellerError } = await db.from('merchants')
        .update({
          business_name: String(claim.business_name || claim.owner_name || 'My business'),
          owner_name: String(claim.owner_name || claim.business_name || 'Seller'),
          phone: claim.phone || null,
          whatsapp: claim.phone || null,
          category: claim.category || 'Other',
          building_name: claim.building_name || null,
          stall_label: claim.loc || null,
          ll_phone_verified: !!claim.verified,
          claimed: true,
        })
        .eq('slug', session.merchantSlug)
        .select('slug').maybeSingle();

      if (sellerError || !seller) {
        await db.from('claims').update({ status: 'INVITED', claimed_at: null })
          .eq('token', token).eq('status', 'CLAIMED');
        return NextResponse.json({ ok: false, error: 'Your seller profile could not be linked. Please try again.' }, { status: 500 });
      }
      return NextResponse.json({ ok: true, claim: toClientClaim({ ...claim, status: 'CLAIMED', claimed_at: now }) });
    }

    if (session.role !== 'agent') {
      return NextResponse.json({ ok: false, error: 'Only agents can create or update claim invitations' }, { status: 403 });
    }

    const c = body?.claim;
    if (!c || typeof c !== 'object') return NextResponse.json({ ok: false, error: 'Missing claim' }, { status: 400 });

    const token = String(c.token ?? '').trim().slice(0, 120);
    const businessName = String(c.businessName ?? '').trim().slice(0, 200);
    const ownerName = String(c.ownerName ?? '').trim().slice(0, 200);
    const phone = String(c.phone ?? '').trim().slice(0, 40);
    const buildingName = String(c.buildingName ?? '').trim().slice(0, 200);
    const loc = String(c.loc ?? '').trim().slice(0, 120);
    if (!token || !businessName || !ownerName || !phone || !buildingName || !loc) {
      return NextResponse.json({ ok: false, error: 'Seller name, owner, phone, building and stall are required' }, { status: 400 });
    }
    if (!/^(?:0\\d{9}|\\+?254\\d{9})$/.test(phone.replace(/[\\s()-]/g, ''))) {
      return NextResponse.json({ ok: false, error: 'Enter a valid Kenyan seller phone number' }, { status: 400 });
    }

    const { data: existing, error: existingError } = await db.from('claims')
      .select('token, created_by, building_name, business_name')
      .eq('token', token).maybeSingle();
    if (existingError) return NextResponse.json({ ok: false, error: 'Could not save claim' }, { status: 500 });
    if (existing && existing.created_by && existing.created_by !== session.userId) {
      return NextResponse.json({ ok: false, error: 'This claim belongs to another agent' }, { status: 409 });
    }

    const row = {
      client_id: String(c.id ?? token).slice(0, 120),
      token,
      business_name: businessName,
      owner_name: ownerName,
      phone,
      category: String(c.category ?? '').slice(0, 80) || null,
      floor: String(c.floor ?? '').slice(0, 20) || null,
      number: String(c.number ?? '').slice(0, 20) || null,
      loc,
      building_name: buildingName,
      status: 'INVITED',
      verified: false,
      source: 'agent',
      draft: !!c.draft,
      created_by: session.userId,
      sent_at: c.sentAt && Number.isFinite(new Date(String(c.sentAt)).getTime())
        ? new Date(String(c.sentAt)).toISOString()
        : new Date().toISOString(),
      claimed_at: null,
    };

    const { error } = await db.from('claims').upsert(row, { onConflict: 'token' });
    if (error) return NextResponse.json({ ok: false, error: 'Could not save claim' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not save claim' }, { status: 500 });
  }
}
