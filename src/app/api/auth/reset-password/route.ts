// POST /api/auth/reset-password — perform password reset with token.
import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/session';
import { hasSupabase, supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = String(body?.token ?? '').trim();
  const password = String(body?.password ?? '');
  if (!token) return NextResponse.json({ ok: false, error: 'Token is required' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ ok: false, error: 'Password must be at least 8 characters' }, { status: 400 });
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });

  const db = supabase();
  const { data: row } = await db.from('password_reset_tokens')
    .select('id, user_id, expires_at, used')
    .eq('token', token).maybeSingle();
  if (!row || row.used) return NextResponse.json({ ok: false, error: 'Invalid or used reset link' }, { status: 400 });
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: 'Reset link has expired' }, { status: 400 });
  }

  const { error: updErr } = await db.from('app_users').update({ password_hash: hashPassword(password) }).eq('id', row.user_id);
  if (updErr) return NextResponse.json({ ok: false, error: 'Could not update password' }, { status: 500 });

  await db.from('password_reset_tokens').update({ used: true }).eq('id', row.id);
  return NextResponse.json({ ok: true, message: 'Password updated. You can now sign in.' });
}