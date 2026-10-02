import { NextRequest, NextResponse } from 'next/server';
import { getSession, hashPin } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: 'Session expired. Sign in again.' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const pin = String(body?.pin ?? '').trim();
  if (!/^\d{6}$/.test(pin)) return NextResponse.json({ ok: false, error: 'PIN must be exactly 6 digits' }, { status: 400 });

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured in this preview.' }, { status: 503 });

  const { error } = await supabase()
    .from('merchants')
    .update({ pin_hash: hashPin(pin, session.phone) })
    .eq('slug', session.merchantSlug);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
