// POST /api/sales/convert - an invoice gets paid: turn it into a receipt.
// Body: { token, code } where code is the extracted M-Pesa reference.

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hasSupabase, supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Session expired. Sign in again.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const token = String(body?.token ?? '').trim();
  const code = String(body?.code ?? '').trim().toUpperCase();
  if (!token) return NextResponse.json({ ok: false, error: 'Missing invoice' }, { status: 400 });
  if (!/^[A-Z0-9]{8,12}$/.test(code)) {
    return NextResponse.json({ ok: false, error: 'Invalid M-Pesa code' }, { status: 400 });
  }

  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured.' }, { status: 503 });

  const { data: merchant } = await supabase().from('merchants').select('id').eq('slug', session.merchantSlug).single();
  if (!merchant?.id) return NextResponse.json({ ok: false, error: 'Profile missing' }, { status: 404 });

  const { data: inv } = await supabase()
    .from('invoices')
    .select('*')
    .eq('token', token)
    .eq('merchant_id', merchant.id)
    .maybeSingle();
  if (!inv) return NextResponse.json({ ok: true }); // local-only invoice: nothing to mirror

  if (inv.status === 'PAID') return NextResponse.json({ ok: true, alreadyPaid: true });

  const { data: dup } = await supabase().from('receipts').select('id').eq('mpesa_code', code).limit(1);
  if (dup && dup.length > 0) {
    return NextResponse.json({ ok: false, error: 'M-Pesa code already recorded' }, { status: 200 });
  }

  const { data: inserted, error } = await supabase().from('receipts').insert({
    merchant_id: merchant.id,
    buyer_name: inv.buyer_name,
    buyer_phone: inv.buyer_phone,
    items: inv.items,
    total_kes: inv.total,
    mpesa_code: code,
    delivery: 'pickup',
    status: 'settled',
    demo: !!inv.demo,
  }).select('receipt_no').single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 200 });

  const receipt_no = inserted?.receipt_no ?? '';

  await supabase()
    .from('invoices')
    .update({ status: 'PAID', doc_status: 'COMPLETE', payment_ref: code })
    .eq('id', inv.id);

  return NextResponse.json({ ok: true, receipt_no });
}
