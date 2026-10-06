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

  const seq = await supabase().from('receipts').select('receipt_no').limit(500);
  const maxNo = (seq.data ?? []).reduce((m: number, r: { receipt_no: string | null }) => {
    const n = Number(String(r.receipt_no ?? '').replace(/\D/g, '')) || 0;
    return Math.max(m, n);
  }, 0);
  const receipt_no = '#' + String(maxNo + 1).padStart(5, '0');

  const { error } = await supabase().from('receipts').insert({
    merchant_id: input.merchant_id,
    receipt_no,
    buyer_name: input.buyer_name,
    buyer_phone: input.buyer_phone,
    items: input.items,
    total_kes: input.total_kes,
    mpesa_code: input.mpesa_code,
    delivery: input.delivery,
    status: 'settled',
  });
  if (error) return { error: error.message };
  return { receipt_no };
}
