// Demo-mode session handling. HMAC-signed cookie so the demo works without
// a paid SMS provider. Production path: swap for Twilio Verify + @supabase/ssr.
import crypto from 'crypto';
import { cookies } from 'next/headers';

const SECRET = process.env.SESSION_SECRET || 'plugpay-demo-secret-2026-nairobi';
export const SESSION_COOKIE = 'pp_session';

export interface SessionPayload {
  merchantSlug: string | null;
  phone: string;
  role: 'trader' | 'landlord' | 'agent';
  iat: number;
}

function sign(data: string): string {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
}

export function serializeSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function parseSession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return parseSession(store.get(SESSION_COOKIE)?.value);
}

export function hashPin(pin: string, phone: string): string {
  return crypto.scryptSync(pin, phone + SECRET, 32).toString('hex');
}

export function verifyPin(pin: string, phone: string, hash: string): boolean {
  const candidate = hashPin(pin, phone);
  return candidate.length === hash.length && crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));
}

// ---- One-time code cookie (stateless fallback when the DB is unreachable) ----
export const OTP_COOKIE = 'pp_otc';

interface OtpCookiePayload {
  phone: string;
  code: string;
  exp: number;
}

export function serializeOtpCookie(phone: string, code: string, ttlMinutes = 10): string {
  const payload: OtpCookiePayload = { phone, code, exp: Date.now() + ttlMinutes * 60 * 1000 };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function readOtpCookie(token: string | undefined, phone: string, code: string): boolean {
  if (!token) return false;
  const [body, sig] = token.split('.');
  if (!body || !sig) return false;
  const expected = sign(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return false;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as OtpCookiePayload;
    return payload.phone === phone && payload.code === code && payload.exp > Date.now();
  } catch {
    return false;
  }
}
