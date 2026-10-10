// Seller catalogue persistence, scoped to the signed-in user's merchant.
//   GET            → list products
//   POST           → create a product
//   PATCH ?id=     → update name/price/stock/category
//   DELETE ?id=    → remove a product
// Ownership always comes from the session cookie, never from the request body.

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

type ProductRow = {
  id: string;
  name: string;
  price_kes: number | null;
  stock: number | null;
  category: string | null;
  image_url: string | null;
};

function toClient(p: ProductRow) {
  return {
    id: p.id,
    name: p.name,
    price: p.price_kes ?? 0,
    stock: p.stock ?? 0,
    category: p.category ?? 'General',
    image: p.image_url ?? '',
  };
}

async function merchantIdForSession(): Promise<{ ok: true; id: string } | { ok: false; status: number; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, status: 401, error: 'Sign in to manage your catalogue' };
  if (session.role !== 'trader' || !session.merchantSlug) {
    return { ok: false, status: 403, error: 'Only seller accounts have a catalogue' };
  }
  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return { ok: false, status: 503, error: 'Database not configured' };
  const { data: merchant } = await supabase()
    .from('merchants')
    .select('id')
    .eq('slug', session.merchantSlug)
    .maybeSingle();
  if (!merchant?.id) return { ok: false, status: 404, error: 'Seller profile missing' };
  return { ok: true, id: merchant.id as string };
}

export async function GET() {
  const m = await merchantIdForSession();
  if (!m.ok) return NextResponse.json({ ok: false, error: m.error }, { status: m.status });
  const { supabase } = await import('@/lib/supabase');
  const { data, error } = await supabase()
    .from('products')
    .select('id, name, price_kes, stock, category, image_url')
    .eq('merchant_id', m.id)
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, products: (data ?? []).map(toClient) });
}

export async function POST(req: NextRequest) {
  const m = await merchantIdForSession();
  if (!m.ok) return NextResponse.json({ ok: false, error: m.error }, { status: m.status });
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? '').trim().slice(0, 160);
  const price = Math.max(0, Math.min(10_000_000, Number(body?.price ?? 0) || 0));
  const stock = Math.max(0, Math.min(1_000_000, Number(body?.stock ?? 0) || 0));
  const category = (String(body?.category ?? '').trim() || 'General').slice(0, 80);
  const image = String(body?.image ?? '').trim().slice(0, 500);
  if (!name || price <= 0) {
    return NextResponse.json({ ok: false, error: 'Enter a product name and price' }, { status: 400 });
  }
  const { supabase } = await import('@/lib/supabase');
  const { data, error } = await supabase()
    .from('products')
    .insert({ merchant_id: m.id, name, price_kes: price, stock, category, image_url: image || null })
    .select('id, name, price_kes, stock, category, image_url')
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, product: toClient(data) });
}

export async function PATCH(req: NextRequest) {
  const m = await merchantIdForSession();
  if (!m.ok) return NextResponse.json({ ok: false, error: m.error }, { status: m.status });
  const id = req.nextUrl.searchParams.get('id') ?? String(req.body ? '' : '');
  const body = await req.json().catch(() => null);
  const pid = String(body?.id ?? id ?? '').trim();
  if (!pid) return NextResponse.json({ ok: false, error: 'Missing product id' }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (body?.name !== undefined) patch.name = String(body.name).trim().slice(0, 160);
  if (body?.price !== undefined) patch.price_kes = Math.max(0, Math.min(10_000_000, Number(body.price) || 0));
  if (body?.stock !== undefined) patch.stock = Math.max(0, Math.min(1_000_000, Number(body.stock) || 0));
  if (body?.category !== undefined) patch.category = (String(body.category).trim() || 'General').slice(0, 80);
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: 'Nothing to update' }, { status: 400 });
  }
  const { supabase } = await import('@/lib/supabase');
  const { data, error } = await supabase()
    .from('products')
    .update(patch)
    .eq('id', pid)
    .eq('merchant_id', m.id) // ownership guard
    .select('id, name, price_kes, stock, category, image_url')
    .maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, error: 'Product not found' }, { status: 404 });
  return NextResponse.json({ ok: true, product: toClient(data) });
}

export async function DELETE(req: NextRequest) {
  const m = await merchantIdForSession();
  if (!m.ok) return NextResponse.json({ ok: false, error: m.error }, { status: m.status });
  const pid = req.nextUrl.searchParams.get('id') ?? '';
  if (!pid) return NextResponse.json({ ok: false, error: 'Missing product id' }, { status: 400 });
  const { supabase } = await import('@/lib/supabase');
  const { error } = await supabase().from('products').delete().eq('id', pid).eq('merchant_id', m.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
