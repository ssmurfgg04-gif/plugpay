// POST /api/follow — toggle a follow on a seller profile. Body: { slug }
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { limitAuth } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const { ok: rlOk } = limitAuth('follow', clientIP, 30, 60_000);
  if (!rlOk) return NextResponse.json({ ok: false, error: 'Too many requests.' }, { status: 429 });

  const session = await getSession();
  if (!session || !session.merchantSlug) return NextResponse.json({ ok: false, error: 'Sign in to follow' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const target = String(body?.slug ?? '').trim();
  if (!target || target === session.merchantSlug) return NextResponse.json({ ok: false, error: 'Invalid target' }, { status: 400 });

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  const db = supabase();

  const { data: existing } = await db.from('follows').select('id').eq('follower_slug', session.merchantSlug).eq('target_slug', target).maybeSingle();
  if (existing?.id) {
    await db.from('follows').delete().eq('id', existing.id);
    return NextResponse.json({ ok: true, following: false });
  }
  await db.from('follows').insert({ follower_slug: session.merchantSlug, target_slug: target });
  return NextResponse.json({ ok: true, following: true });
}
