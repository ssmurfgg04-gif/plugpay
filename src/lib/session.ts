// Session handling for PlugPay portals. HMAC-signed httpOnly cookie.
// The payload identifies the app_users row created at registration; there is
// deliberately no JWT/OAuth machinery: the API layer is the only DB client.
import crypto from 'crypto';
import { cookies } from 'next/headers';

const SECRET =
  process.env.SESSION_SECRET ||
  process.env.PLUGPAY_SESSION_SECRET ||
  'plugpay-demo-secret-2026-nairobi';
export const SESSION_COOKIE = 'pp_session';

export type PortalRole = 'trader' | 'landlord' | 'agent';

export interface SessionPayload {
  userId: string;
  email: string;
  role: PortalRole;
  merchantSlug: string | null;
  landlordId: string | null;
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
    const raw = JSON.parse(Buffer.from(body, 'base64url').toString()) as Partial<SessionPayload>;
    // Sessions issued before the email-auth migration are invalid.
    if (!raw.userId || !raw.email || !raw.role) return null;
    return {
      userId: String(raw.userId),
      email: String(raw.email),
      role: raw.role,
      merchantSlug: raw.merchantSlug ?? null,
      landlordId: raw.landlordId ?? null,
      iat: Number(raw.iat) || 0,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return parseSession(store.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  };
}

// ---- Password hashing (scrypt, per-user random salt) ----
// Format: scrypt$<N>$<saltHex>$<hashHex>
const SCRYPT_N = 16384;
const SCRYPT_KEYLEN = 32;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_N });
  return `scrypt$${SCRYPT_N}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const parts = String(stored).split('$');
  if (parts.length !== 4 || parts[0] !== 'scrypt') return false;
  const N = Number(parts[1]) || SCRYPT_N;
  const salt = Buffer.from(parts[2], 'hex');
  const expected = Buffer.from(parts[3], 'hex');
  const candidate = crypto.scryptSync(password, salt, expected.length, { N });
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}
