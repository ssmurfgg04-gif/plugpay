import { NextRequest, NextResponse } from 'next/server';

const KENYAN_PHONE = /^(?:\+?254|0)(7\d{8}|1\d{8})$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const raw = String(body?.phone ?? '');
  const digits = raw.replace(/\s/g, '');
  if (!KENYAN_PHONE.test(digits)) {
    return NextResponse.json(
      { ok: false, error: 'Enter a valid Kenyan number, e.g. 0712 345 678' },
      { status: 400 },
    );
  }

  const normalized = digits.replace(/^\+?254/, '0');
  const code = String(Math.floor(100000 + Math.random() * 900000));

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (hasSupabase) {
    await supabase().from('otp_codes').upsert({
      phone: normalized,
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
  }

  // Demo mode: the OTP is surfaced in the UI instead of a paid WhatsApp/SMS
  // dispatch. Production path: Twilio Verify or the Supabase send-SMS hook.
  return NextResponse.json({ ok: true, phone: normalized, demoCode: code });
}
