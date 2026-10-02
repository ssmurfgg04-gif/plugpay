import { NextRequest, NextResponse } from 'next/server';
import { addVouch } from '@/lib/data';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: 'Sign in to your stall first, then you can vouch for neighbours.' },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => null);
  const toSlug = String(body?.toSlug ?? '');
  if (!toSlug) return NextResponse.json({ ok: false, error: 'Missing trader' }, { status: 400 });

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured in this preview.' }, { status: 503 });

  const { data: from } = await supabase().from('merchants').select('id').eq('slug', session.merchantSlug).single();
  const { data: to } = await supabase().from('merchants').select('id').eq('slug', toSlug).single();
  if (!from?.id || !to?.id) return NextResponse.json({ ok: false, error: 'Trader not found' }, { status: 404 });

  const result = await addVouch(from.id, to.id);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
