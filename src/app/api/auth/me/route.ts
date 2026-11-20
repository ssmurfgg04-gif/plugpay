import { NextResponse } from 'next/server';

export async function GET() {
  const { getSession } = await import('@/lib/session');
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, signedIn: false });
  return NextResponse.json({ ok: true, signedIn: true, userId: session.userId, email: session.email, role: session.role });
}
