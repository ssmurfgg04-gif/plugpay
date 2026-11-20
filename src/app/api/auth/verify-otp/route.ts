// POST /api/auth/verify-otp — verify the 6-digit code. Body: { email, code }
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { normalizeEmail } from '@/lib/session';

export const dynamic = 'force-dynamic';

function hashCode(code: string, salt: string): string {
  return crypto.createHash('sha256').update(code + salt).digest('hex');
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = normalizeEmail(String(body?.email ?? ''));
  const code = String(body?.code ?? '').trim();
  if (!email || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ ok: false, error: 'Enter the 6-digit code' }, { status: 400 });
  }

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  const db = supabase();

  const { data: row } = await db.from('otp_codes').select('id, code_hash, expires_at, attempts, used')
    .eq('email', email).eq('used', false).order('created_at', { ascending: false }).limit(1).maybeSingle();

  if (!row) return NextResponse.json({ ok: false, error: 'No pending code. Request a new one.' }, { status: 400 });
  if (row.attempts >= 5) return NextResponse.json({ ok: false, error: 'Too many attempts. Request a new code.' }, { status: 429 });
  if (new Date(row.expires_at).getTime() < Date.now()) return NextResponse.json({ ok: false, error: 'Code expired. Request a new one.' }, { status: 410 });

  const [salt, hash] = String(row.code_hash).split('$');
  const candidate = hashCode(code, salt);
  const ok = crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));

  await db.from('otp_codes').update({ attempts: row.attempts + 1, used: ok }).eq('id', row.id);

  if (!ok) return NextResponse.json({ ok: false, error: 'Incorrect code' }, { status: 401 });

  // Issue a short-lived verification token (signed) so set-pin can trust the email.
  const token = crypto.randomBytes(24).toString('hex');
  await db.from('otp_codes').update({ code_hash: `${salt}$${hash}$${token}` }).eq('id', row.id);
  return NextResponse.json({ ok: true, verified: true, token });
}
