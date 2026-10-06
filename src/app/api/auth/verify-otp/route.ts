import { NextRequest, NextResponse } from 'next/server';
import { OTP_COOKIE, SESSION_COOKIE, readOtpCookie, serializeSession } from '@/lib/session';

const ROLES = ['trader', 'landlord', 'agent'];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const phone = String(body?.phone ?? '').trim();
  const code = String(body?.code ?? '').trim();
  const role = ROLES.includes(String(body?.role)) ? String(body.role) : 'trader';
  if (!phone || !/^\d{10}$/.test(phone) || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ ok: false, error: 'Enter the 6-digit code we showed you' }, { status: 400 });
  }

  const { hasSupabase, supabase } = await import('@/lib/supabase');

  // 1) Primary check: the code stored in the database for this phone.
  let dbVerified = false;
  if (hasSupabase) {
    try {
      const { data: otp } = await supabase()
        .from('otp_codes')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();
      if (otp && otp.code === code && new Date(otp.expires_at).getTime() > Date.now()) {
        dbVerified = true;
        await supabase().from('otp_codes').delete().eq('phone', phone);
      }
    } catch {
      // fall through to the cookie check
    }
  }

  // 2) Fallback check: the signed one-time-code cookie issued by send-otp.
  let cookieVerified = false;
  if (!dbVerified) {
    cookieVerified = readOtpCookie(req.cookies.get(OTP_COOKIE)?.value, phone, code);
  }

  if (!dbVerified && !cookieVerified) {
    return NextResponse.json({ ok: false, error: 'That code is wrong or expired. Request a new one.' }, { status: 401 });
  }

  let slug: string | null = null;
  let matched = false;

  if (role === 'trader') {
    // Find the merchant whose phone matches, else create a trader shell.
    const digits = phone.replace(/^\+?254/, '0');
    const alt = `+254 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    if (hasSupabase) {
      try {
        const { data: merchant } = await supabase()
          .from('merchants')
          .select('slug, phone')
          .or(`phone.eq.${digits},phone.eq.${alt},phone.eq.${phone}`)
          .maybeSingle();

        if (merchant?.slug) {
          slug = merchant.slug;
          matched = true;
        } else {
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
      } catch {
        slug = null;
      }
    }
    // Last resort (no DB): issue a transient profile so the preview still works.
    if (!slug) slug = `trader-${phone.slice(-6)}-offline`;
  }

  const res = NextResponse.json({ ok: true, slug, role, matched });
  res.cookies.set(
    SESSION_COOKIE,
    serializeSession({ merchantSlug: slug, phone, role: role as 'trader' | 'landlord' | 'agent', iat: Date.now() }),
    {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    },
  );
  res.cookies.delete(OTP_COOKIE);
  return res;
}
