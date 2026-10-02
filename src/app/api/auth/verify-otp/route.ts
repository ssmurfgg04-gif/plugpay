import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, serializeSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const phone = String(body?.phone ?? '').trim();
  const code = String(body?.code ?? '').trim();
  if (!phone || !/^\d{10}$/.test(phone) || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ ok: false, error: 'Enter the 6-digit code we showed you' }, { status: 400 });
  }

  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) {
    return NextResponse.json({ ok: false, error: 'Database not configured in this preview.' }, { status: 503 });
  }

  const { data: otp } = await supabase()
    .from('otp_codes')
    .select('*')
    .eq('phone', phone)
    .single();

  if (!otp || otp.code !== code || new Date(otp.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: 'That code is wrong or expired. Request a new one.' }, { status: 401 });
  }
  await supabase().from('otp_codes').delete().eq('phone', phone);

  // Find the merchant whose phone matches, else create a demo trader shell
  const digits = phone.replace(/^\+?254/, '0');
  const alt = `+254 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  let { data: merchant } = await supabase()
    .from('merchants')
    .select('slug, phone')
    .or(`phone.eq.${digits},phone.eq.${alt},phone.eq.${phone}`)
    .maybeSingle();

  let slug = merchant?.slug ?? null;
  if (!slug) {
    const created = await supabase()
      .from('merchants')
      .insert({
        slug: `trader-${digits.slice(-6)}-${Date.now().toString(36)}`,
        business_name: `Trader ${digits.slice(-4)}`,
        owner_name: 'New trader',
        category: 'Other',
        phone: digits,
        verified: 'basic',
        is_demo: true,
        claimed: true,
      })
      .select('slug')
      .single();
    slug = created.data?.slug ?? null;
  }

  if (!slug) {
    return NextResponse.json({ ok: false, error: 'Could not open a profile for this number.' }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, slug, matched: Boolean(merchant) });
  res.cookies.set(SESSION_COOKIE, serializeSession({ merchantSlug: slug, phone, role: 'trader', iat: Date.now() }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return res;
}
