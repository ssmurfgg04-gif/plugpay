// POST /api/auth/forgot-password — request a password reset link.
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { normalizeEmail } from '@/lib/session';
import { hasSupabase, supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = normalizeEmail(String(body?.email ?? ''));
  if (!email) return NextResponse.json({ ok: false, error: 'Email is required' }, { status: 400 });
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });

  const db = supabase();
  const { data: user } = await db.from('app_users').select('id, email').eq('email', email).maybeSingle();

  // Always respond ok to avoid email enumeration.
  if (!user?.id) {
    return NextResponse.json({ ok: true, message: 'If that email is registered, a reset link has been sent.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // 30 min
  await db.from('password_reset_tokens').insert({ user_id: user.id, token, expires_at: expiresAt });

  const origin = req.nextUrl.origin;
  const resetLink = `${origin}/reset-password?token=${token}`;

  // Send email via Resend if configured.
  const resendKey = process.env.RESEND_API_KEY || '';
  if (resendKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'PlugPay <noreply@plugpay.co.ke>',
          to: [email],
          subject: 'Reset your PlugPay password',
          html: `<p>Click the link below to reset your password (valid for 30 minutes):</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, ignore this email.</p>`,
        }),
      });
    } catch (e) {
      // Fall through; link still returned for dev.
    }
  }

  return NextResponse.json({ ok: true, message: 'If that email is registered, a reset link has been sent.', ...(process.env.NODE_ENV !== 'production' ? { resetLink } : {}) });
}