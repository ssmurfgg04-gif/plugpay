// GET /api/admin/documents/:id/signed-url — short-lived signed URL for a private document.
import { NextRequest, NextResponse } from 'next/server';
import { getSession, isAdminEmail } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const admin = session?.role === 'admin' || isAdminEmail(session?.email);
  if (!admin) return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 });

  const { id } = await ctx.params;
  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  const db = supabase();

  const { data: doc } = await db.from('documents').select('storage_path').eq('id', id).maybeSingle();
  if (!doc?.storage_path) return NextResponse.json({ ok: false, error: 'Document not found' }, { status: 404 });

  const { data, error } = await db.storage.from('private-documents').createSignedUrl(doc.storage_path, 60 * 5);
  if (error || !data?.signedUrl) return NextResponse.json({ ok: false, error: 'Could not sign URL' }, { status: 500 });
  return NextResponse.json({ ok: true, url: data.signedUrl });
}
