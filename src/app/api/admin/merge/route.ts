// POST /api/admin/merge — combine two accounts (source -> target).
import { NextRequest, NextResponse } from 'next/server';
import { getSession, isAdminEmail } from '@/lib/session';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getSession();
  const admin = session?.role === 'admin' || isAdminEmail(session?.email);
  if (!admin) return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const source = String(body?.source ?? '').trim();
  const target = String(body?.target ?? '').trim();
  if (!source || !target || source === target) return NextResponse.json({ ok: false, error: 'Invalid source/target' }, { status: 400 });

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  const db = supabase();

  try {
    // Reassign receipts, invoices, reviews, vouches from source merchant to target.
    const { data: srcM } = await db.from('merchants').select('id').eq('slug', source).maybeSingle();
    const { data: tgtM } = await db.from('merchants').select('id').eq('slug', target).maybeSingle();
    if (!srcM?.id || !tgtM?.id) return NextResponse.json({ ok: false, error: 'Merchant not found' }, { status: 404 });

    await db.from('receipts').update({ merchant_id: tgtM.id }).eq('merchant_id', srcM.id);
    await db.from('invoices').update({ merchant_id: tgtM.id }).eq('merchant_id', srcM.id);
    await db.from('reviews').update({ merchant_id: tgtM.id }).eq('merchant_id', srcM.id);
    await db.from('vouches').update({ to_seller: tgtM.id }).eq('to_seller', srcM.id);
    await db.from('vouches').update({ from_seller: tgtM.id }).eq('from_seller', srcM.id);
    await db.from('merchants').delete().eq('id', srcM.id);
    try { await db.from('app_users').delete().eq('merchant_slug', source); } catch { /* ignore */ }

    await logAudit('admin:merge', session?.userId ?? null, { source, target });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Merge failed' }, { status: 500 });
  }
}
