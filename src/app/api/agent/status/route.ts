import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hasSupabase, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'agent') return NextResponse.json({ ok: false, error: 'Sign in as an agent' }, { status: 401 });
  if (!hasSupabase) return NextResponse.json({ ok: true, status: 'active' });
  try {
    const { data } = await supabase().from('app_users').select('status').eq('id', session.userId).maybeSingle();
    return NextResponse.json({ ok: true, status: String(data?.status ?? 'active') });
  } catch {
    return NextResponse.json({ ok: true, status: 'active' });
  }
}
