// POST /api/admin/action — admin-only state changes on a merchant.
// Body: { action, slug, value? }
import { NextRequest, NextResponse } from 'next/server';
import { getSession, isAdminEmail } from '@/lib/session';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getSession();
  const admin = session?.role === 'admin' || isAdminEmail(session?.email);
  if (!admin) return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const action = String(body?.action ?? '').trim();
  const slug = String(body?.slug ?? '').trim();
  if (!action || !slug) return NextResponse.json({ ok: false, error: 'Missing action or slug' }, { status: 400 });

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  const db = supabase();

  try {
    if (action === 'suspend') {
      await db.from('merchants').update({ suspended: true }).eq('slug', slug);
    } else if (action === 'restore') {
      await db.from('merchants').update({ suspended: false }).eq('slug', slug);
    } else if (action === 'verify_badge') {
      await db.from('merchants').update({ verified: 'verified', badge_override: 'verified' }).eq('slug', slug);
    } else if (action === 'revoke_badge') {
      await db.from('merchants').update({ verified: 'basic', badge_override: null }).eq('slug', slug);
    } else if (action === 'trust_override') {
      const v = Number(body?.value);
      if (!Number.isFinite(v)) return NextResponse.json({ ok: false, error: 'Invalid trust value' }, { status: 400 });
      await db.from('merchants').update({ trust_override: v, trust_score: v }).eq('slug', slug);
    } else if (action === 'vacate') {
      await db.from('merchants').update({ building_name: null, stall_label: null }).eq('slug', slug);
    } else {
      return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
    }
    await logAudit(`admin:${action}`, session?.userId ?? null, { slug, value: body?.value });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Action failed' }, { status: 500 });
  }
}
