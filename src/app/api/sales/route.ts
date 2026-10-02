import { NextRequest, NextResponse } from 'next/server';
import { createReceipt } from '@/lib/data';
import { getSession } from '@/lib/session';

interface SaleItem { name: string; qty: number; price: number }

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Session expired. Sign in again.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const buyerName = String(body?.buyerName ?? '').trim();
  const buyerPhone = String(body?.buyerPhone ?? '').trim();
  const mpesaCode = String(body?.mpesaCode ?? '').trim().toUpperCase();
  const delivery = body?.delivery === 'runner' ? 'runner' : 'pickup';
  const items: SaleItem[] = Array.isArray(body?.items)
    ? body.items
        .map((i: { name?: string; qty?: number; price?: number }) => ({
          name: String(i?.name ?? '').trim(),
          qty: Math.max(1, Math.min(999, Number(i?.qty ?? 1) || 1)),
          price: Math.max(0, Math.min(10_000_000, Number(i?.price ?? 0) || 0)),
        }))
        .filter((i: SaleItem) => i.name.length > 0)
    : [];

  if (!buyerName) return NextResponse.json({ ok: false, error: 'Buyer name is required' }, { status: 400 });
  if (!/^0\d{9}$/.test(buyerPhone.replace(/\s/g, ''))) {
    return NextResponse.json({ ok: false, error: 'Buyer phone must be a Kenyan number like 0712345678' }, { status: 400 });
  }
  if (items.length === 0) return NextResponse.json({ ok: false, error: 'Add at least one item' }, { status: 400 });
  if (!/^[A-Z0-9]{8,12}$/.test(mpesaCode)) {
    return NextResponse.json({ ok: false, error: 'Enter the M-Pesa confirmation code from the payment SMS' }, { status: 400 });
  }

  const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured in this preview.' }, { status: 503 });

  const { data: merchant } = await supabase().from('merchants').select('id').eq('slug', session.merchantSlug).single();
  if (!merchant?.id) return NextResponse.json({ ok: false, error: 'Profile missing' }, { status: 404 });

  const result = await createReceipt({
    merchant_id: merchant.id,
    buyer_name: buyerName,
    buyer_phone: buyerPhone,
    items,
    total_kes: total,
    mpesa_code: mpesaCode,
    delivery,
  });

  if ('error' in result) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, ...result });
}
