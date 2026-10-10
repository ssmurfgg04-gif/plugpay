// GET /api/auth/session — whoami for restoring the portal session on load.
// POST /api/auth/logout handled in ./logout/route.ts.

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, signedIn: false });
  return NextResponse.json({
    ok: true,
    signedIn: true,
    userId: session.userId,
    email: session.email,
    role: session.role,
    merchantSlug: session.merchantSlug,
    landlordId: session.landlordId,
  });
}
