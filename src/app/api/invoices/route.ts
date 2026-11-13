// POST /api/invoices - create a pay-link invoice for the signed-in seller.
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hasSupabase, supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Session expired. Sign in again.' }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const buyerName = String(body?.buyerName ?? '').trim();
  const buyerPhone = String(body?.buyerPhone ?? '').trim();
  const source = String(body?.source ?? 'WhatsApp').trim().slice(0, 40) || 'WhatsApp';
  const items = Array.isArray(body?.items)
    ? body.items.map((i: { name?: unknown; qty?: unknown; price?: unknown; unit?: unknown }) => ({
        name: String(i?.name ?? '').trim(),
        qty: Math.max(1, Math.min(999, Number(i?.qty ?? 1) || 1)),
        price: Math.max(0, Math.min(10_000_000, Number(i?.price ?? 0) || 0)),
        unit: Math.max(0, Math.min(10_000_000, Number(i?.unit ?? 0) || 0)),
      })).filter((i: { name: string }) => i.name.length > 0)
    : [];
  if (!buyerName) return NextResponse.json({ ok: false, error: 'Buyer name is required' }, { status: 400 });
  if (!/^0\d{9}$/.test(buyerPhone.replace(/\s/g, ''))) {
    return NextResponse.json({ ok: false, error: 'Buyer phone must be a Kenyan number like 0712345678' }, { status: 400 });
  }
  if (items.length === 0) return NextResponse.json({ ok: false, error: 'Add at least one item' }, { status: 400 });

  const total = items.reduce((sum: number, i: { price: number }) => sum + i.price, 0);
  const { hasSupabase: has, supabase: sb } = await import('@/lib/supabase');
  if (!has) return NextResponse.json({ ok: false, error: 'Database not configured in this preview.' }, { status: 503 });

  const { data: merchant } = await sb().from('merchants').select('id').eq('slug', session.merchantSlug).single();
  if (!merchant?.id) return NextResponse.json({ ok: false, error: 'Profile missing' }, { status: 404 });

  const token = String(body?.token ?? '').trim() || ('inv' + Date.now().toString(36));
  const { error } = await sb().from('invoices').insert({
    merchant_id: merchant.id,
    token,
    number: token,
    buyer_name: buyerName,
    buyer_phone: buyerPhone,
    source,
    items,
    total,
    status: 'PENDING',
    doc_status: 'PENDING',
    demo: false,
  });
  if (error) {
    if (/unique/i.test(error.message)) {
      return NextResponse.json({ ok: false, error: 'Invoice token already exists' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, token });
}