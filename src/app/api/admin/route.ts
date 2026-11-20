// GET /api/admin — platform-wide admin payload (admin role only).
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hasSupabase, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 });
  }
  try {
    const db = supabase();
    const [usersRes, merchantsRes, buildingsRes, receiptsRes, invoicesRes, claimsRes] = await Promise.all([
      db.from('app_users').select('id, email, role, merchant_slug, landlord_id, created_at').order('created_at', { ascending: false }).limit(500),
      db.from('merchants').select('id, slug, business_name, owner_name, email, category, building_name, stall_label, verified, trust_score, sales_count, rating_avg, rating_count, claimed, is_demo, created_at').order('created_at', { ascending: false }).limit(500),
      db.from('buildings').select('id, slug, name, address, area, total_stalls, registered_merchants, avg_rating, coverage_pct, verified, created_at').order('created_at', { ascending: false }).limit(500),
      db.from('receipts').select('id, receipt_no, merchant_id, buyer_name, buyer_phone, total_kes, mpesa_code, delivery, status, created_at').order('created_at', { ascending: false }).limit(500),
      db.from('invoices').select('id, token, number, merchant_id, buyer_name, buyer_phone, total, status, created_at').order('created_at', { ascending: false }).limit(500),
      db.from('claims').select('id, token, business_name, owner_name, phone, building_name, loc, status, verified, created_by, created_at').order('created_at', { ascending: false }).limit(500),
    ]);
    // map merchant_id -> slug for receipts/invoices
    const merchMap = new Map((merchantsRes.data ?? []).map((m: Record<string, unknown>) => [String(m.id), String(m.slug ?? '')]));
    const merchNameMap = new Map((merchantsRes.data ?? []).map((m: Record<string, unknown>) => [String(m.id), String(m.business_name ?? '')]));
    const receipts = (receiptsRes.data ?? []).map((r: Record<string, unknown>) => ({
      id: String(r.id),
      receipt_no: String(r.receipt_no ?? ''),
      merchant_slug: merchMap.get(String(r.merchant_id)) ?? '',
      merchant_name: merchNameMap.get(String(r.merchant_id)) ?? '',
      buyer_name: String(r.buyer_name ?? ''),
      buyer_phone: String(r.buyer_phone ?? ''),
      total_kes: Number(r.total_kes ?? 0),
      mpesa_code: String(r.mpesa_code ?? ''),
      delivery: String(r.delivery ?? ''),
      status: String(r.status ?? ''),
      created_at: String(r.created_at ?? ''),
    }));
    const invoices = (invoicesRes.data ?? []).map((v: Record<string, unknown>) => ({
      id: String(v.id),
      token: String(v.token ?? ''),
      number: String(v.number ?? ''),
      merchant_slug: merchMap.get(String(v.merchant_id)) ?? '',
      merchant_name: merchNameMap.get(String(v.merchant_id)) ?? '',
      buyer_name: String(v.buyer_name ?? ''),
      buyer_phone: String(v.buyer_phone ?? ''),
      total: Number(v.total ?? 0),
      status: String(v.status ?? ''),
      created_at: String(v.created_at ?? ''),
    }));
    return NextResponse.json({
      ok: true,
      stats: {
        users: (usersRes.data ?? []).length,
        merchants: (merchantsRes.data ?? []).length,
        buildings: (buildingsRes.data ?? []).length,
        receipts: receipts.length,
        invoices: invoices.length,
        claims: (claimsRes.data ?? []).length,
        totalSalesKes: receipts.reduce((s, r) => s + r.total_kes, 0),
      },
      users: usersRes.data ?? [],
      merchants: merchantsRes.data ?? [],
      buildings: buildingsRes.data ?? [],
      receipts,
      invoices,
      claims: claimsRes.data ?? [],
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const action = String(body?.action ?? '');
  const buildingId = String(body?.buildingId ?? '').trim();
  if (action === 'verifyBuilding' || action === 'revokeBuilding') {
    if (!buildingId) return NextResponse.json({ ok: false, error: 'buildingId required' }, { status: 400 });
    const verified = action === 'verifyBuilding';
    const { error } = await supabase().from('buildings').update({ verified }).eq('id', buildingId);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, verified });
  }
  return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const userId = String(body?.userId ?? '').trim();
  if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 });
  if (userId === session.userId) return NextResponse.json({ ok: false, error: 'Cannot delete your own account' }, { status: 400 });
  try {
    const db = supabase();
    // fetch user to get merchant/landlord refs
    const { data: u } = await db.from('app_users').select('id, role, merchant_slug, landlord_id').eq('id', userId).maybeSingle();
    if (u?.merchant_slug) {
      await db.from('merchants').delete().eq('slug', u.merchant_slug);
    }
    if (u?.landlord_id) {
      await db.from('landlord_accounts').delete().eq('id', u.landlord_id);
    }
    await db.from('app_users').delete().eq('id', userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}