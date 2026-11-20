// POST /api/auth/refresh — rotate the long-lived refresh token (30-day persistence,
// HMAX signed, cookie-locked when browser support allows, otherwise query-param based).
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  parseRefreshToken,
  serializeRefreshToken,
  serializeSession,
  sessionCookieOptions,
  SESSION_REFRESH_COOKIE,
} from '@/lib/session';
import { refreshAppUser } from '@/lib/refresh';

export async function POST(req: NextRequest) {
  let token = req.cookies.get(SESSION_REFRESH_COOKIE)?.value || undefined;
  const q = req.nextUrl.searchParams.get('token');
  if (!token && q) token = q;
  const parsed = parseRefreshToken(token);
  if (!parsed) {
    return NextResponse.json({ ok: false, error: 'Signed refresh token is not valid or missing.' }, { status: 401 });
  }
  try {
    const row = await refreshAppUser(parsed.userId);
    if (!row) {
      return NextResponse.json({ ok: false, error: 'No account matches your refresh token.' }, { status: 401 });
    }
    const session = serializeSession({
      userId: row.id, email: row.email, role: row.role as 'trader' | 'landlord' | 'agent' | 'admin',
      merchantSlug: row.merchant_slug ?? null, landlordId: row.landlord_id ?? null,
      iat: Date.now(),
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_REFRESH_COOKIE, serializeRefreshToken({ userId: row.id, iat: Date.now() }), sessionCookieOptions());
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Refresh failed. Try logging in again.' }, { status: 500 });
  }
}
