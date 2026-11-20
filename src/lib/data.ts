// Data access helpers used by the API routes. Reads from Supabase
// (credentials resolved by lib/supabase, env first with built-in fallback).

import { hasSupabase, supabase } from './supabase';

export interface SearchRow {
  slug: string;
  business_name: string;
  category: string | null;
  building_name: string | null;
  stall_label: string | null;
  verified: string | null;
  rating_avg: number | null;
  sales_count: number | null;
  avatar_url: string | null;
}

export interface BuildingRow {
  slug: string;
  name: string;
  address: string | null;
  area: string | null;
  total_stalls: number | null;
  coverage_pct: number | null;
  avg_rating: number | null;
  image_url: string | null;
}

export async function searchAll(
  q: string,
): Promise<{ merchants: SearchRow[]; buildings: BuildingRow[] }> {
  if (!hasSupabase) return { merchants: [], buildings: [] };
  const term = `%${q}%`;
  const [mRes, bRes] = await Promise.all([
    supabase()
      .from('merchants')
      .select(
        'slug,business_name,category,building_name,stall_label,verified,rating_avg,sales_count,avatar_url',
      )
      .or(
        `business_name.ilike.${term},category.ilike.${term},building_name.ilike.${term},owner_name.ilike.${term}`,
      )
      .limit(12),
    supabase()
      .from('buildings')
      .select('slug,name,address,area,total_stalls,coverage_pct,avg_rating,image_url')
      .or(`name.ilike.${term},address.ilike.${term},area.ilike.${term}`)
      .limit(6),
  ]);
  return {
    merchants: (mRes.data as SearchRow[]) ?? [],
    buildings: (bRes.data as BuildingRow[]) ?? [],
  };
}

export async function addVouch(
  fromMerchantId: string,
  toMerchantId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabase) return { ok: false, error: 'Database not configured in this preview.' };
  if (fromMerchantId === toMerchantId) return { ok: false, error: 'You cannot vouch for yourself.' };
  const { error } = await supabase()
    .from('vouches')
    .insert({ from_merchant: fromMerchantId, to_merchant: toMerchantId });
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'You have already vouched for this trader.' };
    return { ok: false, error: error.message };
  }
  const to = await supabase()
    .from('merchants')
    .select('vouches_received, trust_score')
    .eq('id', toMerchantId)
    .single();
  if (to.data) {
    await supabase()
      .from('merchants')
      .update({
        vouches_received: (to.data.vouches_received ?? 0) + 1,
        trust_score: Math.min(99, (to.data.trust_score ?? 0) + 2),
      })
      .eq('id', toMerchantId);
  }
  return { ok: true };
}

export async function createReceipt(input: {
  merchant_id: string;
  buyer_name: string;
  buyer_phone: string;
  items: { name: string; qty: number; price: number }[];
  total_kes: number;
  mpesa_code: string;
  delivery: 'pickup' | 'runner';
}): Promise<{ receipt_no: string } | { error: string }> {
  if (!hasSupabase) return { error: 'Database not configured in this preview.' };

  const dup = await supabase()
    .from('receipts')
    .select('id')
    .eq('mpesa_code', input.mpesa_code)
    .limit(1);
  if (dup.data && dup.data.length > 0) {
    return { error: 'This M-Pesa code has already been recorded.' };
  }

  // Stock check: block the sale if any item's stock would go negative.
  const { data: products } = await supabase()
    .from('products')
    .select('id, name, stock')
    .eq('merchant_id', input.merchant_id);
  const productByName = new Map<string, { id: string; stock: number | null }>();
  for (const p of products ?? []) {
    productByName.set(String(p.name).trim().toLowerCase(), { id: String(p.id), stock: p.stock });
  }
  const decrements: { id: string; qty: number }[] = [];
  for (const item of input.items) {
    const prod = productByName.get(item.name.trim().toLowerCase());
    if (!prod) continue;
    if (prod.stock !== null && prod.stock < item.qty) {
      return { error: `Not enough stock for "${item.name}" (have ${prod.stock}, need ${item.qty}).` };
    }
    decrements.push({ id: prod.id, qty: item.qty });
  }

  // receipt_no is assigned atomically by the receipts_set_no DB trigger
  // (backed by receipts_no_seq) to avoid collisions under concurrent inserts.
  const { data: inserted, error } = await supabase()
    .from('receipts')
    .insert({
      merchant_id: input.merchant_id,
      buyer_name: input.buyer_name,
      buyer_phone: input.buyer_phone,
      items: input.items,
      total_kes: input.total_kes,
      mpesa_code: input.mpesa_code,
      delivery: input.delivery,
      status: 'settled',
    })
    .select('receipt_no')
    .single();
  if (error) {
    if (/unique/i.test(error.message) && /mpesa/i.test(error.message)) {
      return { error: 'This M-Pesa code has already been recorded.' };
    }
    return { error: error.message };
  }

  // Decrement stock for matched products (best-effort, after successful insert).
  for (const d of decrements) {
    try {
      const prod = (products ?? []).find((p) => String(p.id) === d.id);
      const newStock = (prod?.stock ?? 0) - d.qty;
      await supabase().from('products').update({ stock: Math.max(0, newStock) }).eq('id', d.id);
    } catch {
      // ignore; sale already recorded
    }
  }
  return { receipt_no: inserted?.receipt_no ?? '' };
}
