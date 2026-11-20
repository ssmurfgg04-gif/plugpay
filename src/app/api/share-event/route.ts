// POST /api/share-event — record a profile-card share (counts as 1 Engagement).
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { limitAuth } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const { ok: rlOk } = limitAuth('share-event', clientIP, 30, 60_000);
  if (!rlOk) return NextResponse.json({ ok: false, error: 'Too many requests.' }, { status: 429 });

  const session = await getSession();
  if (!session || !session.merchantSlug) return NextResponse.json({ ok: false, error: 'Sign in first' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const channel = String(body?.channel ?? 'whatsapp').trim().slice(0, 40);

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return NextResponse.json({ ok: true, recorded: false });
  const db = supabase();

  const { data: merchant } = await db.from('merchants').select('id').eq('slug', session.merchantSlug).maybeSingle();
  if (merchant?.id) {
    try { await db.from('share_events').insert({ merchant_id: merchant.id, channel }); } catch { /* table may not exist */ }
    try { await db.rpc('increment_engagement', { m_id: merchant.id }); } catch { /* no rpc; ignore */ }
  }
  return NextResponse.json({ ok: true, recorded: true });
}
