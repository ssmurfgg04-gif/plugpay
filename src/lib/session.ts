// Session handling for PlugPay portals. HMAC-signed httpOnly cookie.
// The payload identifies the app_users row created at registration; there is
// deliberately no JWT/OAuth machinery: the API layer is the only DB client.
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { GEN_SESSION_SECRET } from '@/lib/env.gen';

// The Workers runtime does not expose build-time env to functions either. gen-env.mjs
// bakes the configured secret into a server-only module during the build.
const SECRET =
  process.env.SESSION_SECRET ||
  process.env.PLUGPAY_SESSION_SECRET ||
  GEN_SESSION_SECRET ||
  (process.env.NODE_ENV === 'production' ? '' : 'plugpay-local-development-only-change-me');

export const SESSION_COOKIE = 'pp_session';
export const SESSION_REFRESH_COOKIE = 'pp_refresh';
export type PortalRole = 'trader' | 'landlord' | 'agent' | 'admin';

export interface SessionPayload {
  userId: string;
  email: string;
  role: PortalRole;
  merchantSlug: string | null;
  landlordId: string | null;
  iat: number;
  maxAge?: number;
  adminOverride?: boolean;
}

function sign(data: string): string {
  if (!SECRET) throw new Error('SESSION_SECRET must be configured before issuing portal sessions.');
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
}

export function serializeSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function serializeRefreshToken(payload: {userId: string; iat: number}): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign('refresh:' + body)}`;
}

export function parseRefreshToken(token: string | undefined): {userId: string; iat: number} | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign('refresh:' + body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const raw = JSON.parse(Buffer.from(body, 'base64url').toString()) as {userId?: unknown; iat?: unknown};
    if (!raw.userId || typeof raw.userId !== 'string') return null;
    return { userId: raw.userId, iat: Number(raw.iat) || 0 };
  } catch { return null; }
}

export function isAdmin(payload: SessionPayload): boolean {
  return payload.role === 'admin';
}

// Admin accounts: trusted via env list (replaces untracked DB-only roles).
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
export function isAdminEmail(email: string | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export function parseSession(token: string | undefined): SessionPayload | null {
  // Fail closed in production if the deployment did not inject a secret.
  if (!SECRET || !token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const raw = JSON.parse(Buffer.from(body, 'base64url').toString()) as Partial<SessionPayload>;
    const roles: PortalRole[] = ['trader', 'landlord', 'agent', 'admin'];
    if (!raw.userId || !raw.email || !roles.includes(raw.role as PortalRole)) return null;
    const effRole = raw.adminOverride ? 'admin' : (raw.role as PortalRole);
    const session = {
      userId: String(raw.userId),
      email: String(raw.email),
      role: effRole,
      merchantSlug: raw.merchantSlug ?? null,
      landlordId: raw.landlordId ?? null,
      iat: Number(raw.iat) || 0,
      maxAge: Number(raw.maxAge) || 60 * 60 * 4,
      adminOverride: raw.adminOverride === true,
    };
    if (session.adminOverride) {
      session.role = 'admin';
      // Refreshable for days; others via the refresh token machinery.
      session.maxAge = 60 * 60 * 24 * 30;
    }
    if (session.maxAge <= 0) return null;
    const elapsedSec = Math.max(0, (Date.now() - session.iat) / 1000);
    if (session.adminOverride && elapsedSec > 60 * 60 * 24 * 30) return null;
    if (elapsedSec > session.maxAge + 60) return null;
    return session;
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
