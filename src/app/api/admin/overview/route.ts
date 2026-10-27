import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hasSupabase, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Administrator access required' }, { status: 403 });
  }
  if (!hasSupabase) {
    return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  }

  try {
    const db = supabase();
    const [buildings, merchants, agents, landlords, sellers, claims, receipts, invoices] = await Promise.all([
      db.from('buildings').select('id', { count: 'exact', head: true }),
      db.from('merchants').select('id', { count: 'exact', head: true }).eq('is_demo', false),
      db.from('app_users').select('id', { count: 'exact', head: true }).eq('role', 'agent'),
      db.from('app_users').select('id', { count: 'exact', head: true }).eq('role', 'landlord'),
      db.from('app_users').select('id', { count: 'exact', head: true }).eq('role', 'trader'),
      db.from('claims').select('id', { count: 'exact', head: true }),
      db.from('receipts').select('id', { count: 'exact', head: true }),
      db.from('invoices').select('id', { count: 'exact', head: true }),
    ]);

    const failed = [buildings, merchants, agents, landlords, sellers, claims, receipts, invoices]
      .some((result) => result.error);
    if (failed) {
      return NextResponse.json({ ok: false, error: 'Could not load the platform overview' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      counts: {
        buildings: buildings.count ?? 0,
        sellerProfiles: merchants.count ?? 0,
        agents: agents.count ?? 0,
        landlords: landlords.count ?? 0,
        sellerAccounts: sellers.count ?? 0,
        claimLinks: claims.count ?? 0,
        receipts: receipts.count ?? 0,
        invoices: invoices.count ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not load the platform overview' }, { status: 500 });
  }
}
