// Data access layer. Reads from Supabase when configured, falls back to
// bundled seed data so the site renders even without env vars.
import { hasSupabase, supabase } from './supabase';
import {
  fallbackBuildings, fallbackFaqs, fallbackMerchants, fallbackProducts,
  fallbackReviews, fallbackStalls, fallbackStats, fallbackTestimonials,
} from './seed-data';
import type {
  Building, Faq, Merchant, PlatformStats, Product, Review, Stall, Testimonial, Vouch,
} from './types';

export async function getStats(): Promise<PlatformStats> {
  if (!hasSupabase) return fallbackStats;
  const { data } = await supabase().from('platform_stats').select('*').eq('id', 1).single();
  return (data as PlatformStats) ?? fallbackStats;
}

export async function getBuildings(): Promise<Building[]> {
  if (!hasSupabase) return fallbackBuildings;
  const { data } = await supabase().from('buildings').select('*').order('registered_merchants', { ascending: false });
  return (data as Building[]) ?? fallbackBuildings;
}

export async function getBuilding(slug: string): Promise<Building | null> {
  if (!hasSupabase) return fallbackBuildings.find((b) => b.slug === slug) ?? null;
  const { data } = await supabase().from('buildings').select('*').eq('slug', slug).single();
  return (data as Building) ?? null;
}

export async function getMerchants(): Promise<Merchant[]> {
  if (!hasSupabase) return fallbackMerchants;
  const { data } = await supabase().from('merchants').select('*').order('trust_score', { ascending: false });
  return (data as Merchant[]) ?? fallbackMerchants;
}

export async function getMerchant(slug: string): Promise<Merchant | null> {
  if (!hasSupabase) return fallbackMerchants.find((m) => m.slug === slug) ?? null;
  const { data } = await supabase().from('merchants').select('*').eq('slug', slug).single();
  return (data as Merchant) ?? null;
}

export async function getProducts(merchantId?: string): Promise<Product[]> {
  if (!hasSupabase) {
    return merchantId ? fallbackProducts.filter((p) => p.merchant_id === merchantId) : fallbackProducts;
  }
  let q = supabase().from('products').select('*').order('created_at', { ascending: true });
  if (merchantId) q = q.eq('merchant_id', merchantId);
  const { data } = await q;
  return (data as Product[]) ?? [];
}

export async function getReviews(merchantId?: string, limit = 8): Promise<Review[]> {
  if (!hasSupabase) {
    const rows = merchantId ? fallbackReviews.filter((r) => r.merchant_id === merchantId) : fallbackReviews;
    return rows.slice(0, limit);
  }
  let q = supabase().from('reviews').select('*').order('created_at', { ascending: false }).limit(limit);
  if (merchantId) q = q.eq('merchant_id', merchantId);
  const { data } = await q;
  return (data as Review[]) ?? [];
}

export async function getStalls(buildingId?: string): Promise<Stall[]> {
  if (!hasSupabase) {
    return buildingId ? fallbackStalls.filter((s) => s.building_id === buildingId) : fallbackStalls;
  }
  let q = supabase().from('stalls').select('*');
  if (buildingId) q = q.eq('building_id', buildingId);
  const { data } = await q;
  return (data as Stall[]) ?? [];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!hasSupabase) return fallbackTestimonials;
  const { data } = await supabase().from('testimonials').select('*').order('sort');
  return (data as Testimonial[]) ?? fallbackTestimonials;
}

export async function getFaqs(): Promise<Faq[]> {
  if (!hasSupabase) return fallbackFaqs;
  const { data } = await supabase().from('faqs').select('*').order('group_name').order('sort');
  return (data as Faq[]) ?? fallbackFaqs;
}

export async function getVouchesReceived(merchantId: string): Promise<{ from: Merchant }[]> {
  if (!hasSupabase) return [];
  const { data } = await supabase()
    .from('vouches')
    .select('from:merchants!vouches_from_merchant_fkey(*)')
    .eq('to_merchant', merchantId);
  return (data as { from: Merchant }[]) ?? [];
}

export async function getVouchesGiven(merchantId: string, buildingId: string | null): Promise<{ to: Merchant }[]> {
  if (!hasSupabase) return [];
  const { data } = await supabase()
    .from('vouches')
    .select('to:merchants!vouches_to_merchant_fkey(*)')
    .eq('from_merchant', merchantId);
  const rows = (data as { to: Merchant }[]) ?? [];
  return buildingId ? rows.filter((r) => r.to.building_id === buildingId) : rows;
}

// ============ mutations (server actions / route handlers only) ============

export async function searchAll(query: string): Promise<{ merchants: Merchant[]; buildings: Building[] }> {
  const term = `%${query}%`;
  if (!hasSupabase) {
    const lower = query.toLowerCase();
    return {
      merchants: fallbackMerchants.filter(
        (m) => m.business_name.toLowerCase().includes(lower) || m.category.toLowerCase().includes(lower),
      ),
      buildings: fallbackBuildings.filter(
        (b) => b.name.toLowerCase().includes(lower) || b.address.toLowerCase().includes(lower),
      ),
    };
  }
  const [mRes, bRes] = await Promise.all([
    supabase().from('merchants').select('*').or(`business_name.ilike.${term},category.ilike.${term},building_name.ilike.${term},owner_name.ilike.${term}`).limit(12),
    supabase().from('buildings').select('*').or(`name.ilike.${term},address.ilike.${term}`).limit(6),
  ]);
  return { merchants: (mRes.data as Merchant[]) ?? [], buildings: (bRes.data as Building[]) ?? [] };
}

export async function createReceipt(input: {
  merchant_id: string; buyer_name: string; buyer_phone: string;
  items: { name: string; qty: number; price: number }[]; total_kes: number;
  mpesa_code: string; delivery: 'pickup' | 'runner';
}): Promise<{ receipt_no: string } | { error: string }> {
  if (!hasSupabase) return { error: 'Database not configured in this preview. Supabase env vars are required for live sales.' };
  const receiptNo = `#0${Math.floor(10000 + Math.random() * 89999)}`;
  const { error } = await supabase().from('receipts').insert({
    merchant_id: input.merchant_id,
    receipt_no: receiptNo,
    buyer_name: input.buyer_name,
    buyer_phone: input.buyer_phone,
    items: input.items,
    total_kes: input.total_kes,
    mpesa_code: input.mpesa_code,
    delivery: input.delivery,
    status: 'settled',
  });
  if (error) return { error: error.message };
  // bump merchant sales count
  const merchant = await supabase().from('merchants').select('sales_count').eq('id', input.merchant_id).single();
  if (merchant.data) {
    await supabase().from('merchants').update({ sales_count: (merchant.data.sales_count ?? 0) + 1 }).eq('id', input.merchant_id);
  }
  return { receipt_no: receiptNo };
}

export async function addVouch(fromMerchantId: string, toMerchantId: string): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabase) return { ok: false, error: 'Database not configured in this preview.' };
  if (fromMerchantId === toMerchantId) return { ok: false, error: 'You cannot vouch for yourself.' };
  const { error } = await supabase().from('vouches').insert({ from_merchant: fromMerchantId, to_merchant: toMerchantId });
  if (error) {
    if (error.code === '23505') return { ok: false, error: 'You have already vouched for this trader.' };
    return { ok: false, error: error.message };
  }
  const to = await supabase().from('merchants').select('vouches_received, trust_score').eq('id', toMerchantId).single();
  if (to.data) {
    await supabase().from('merchants').update({
      vouches_received: (to.data.vouches_received ?? 0) + 1,
      trust_score: Math.min(99, (to.data.trust_score ?? 0) + 2),
    }).eq('id', toMerchantId);
  }
  return { ok: true };
}

export async function addReview(input: {
  merchant_id: string; receipt_no: string; author_name: string;
  rating: number; body: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabase) return { ok: false, error: 'Database not configured in this preview.' };
  const initials = input.author_name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  // Only receipts that exist can anchor a review (verified-transaction rule)
  const { data: receipt } = await supabase().from('receipts').select('id').eq('receipt_no', input.receipt_no).maybeSingle();
  const { error } = await supabase().from('reviews').insert({
    merchant_id: input.merchant_id,
    receipt_no: receipt ? input.receipt_no : null,
    author_name: input.author_name,
    author_initials: initials,
    rating: input.rating,
    body: input.body,
    verified: Boolean(receipt),
  });
  if (error) return { ok: false, error: error.message };
  const m = await supabase().from('merchants').select('rating_avg, rating_count').eq('id', input.merchant_id).single();
  if (m.data) {
    const newCount = (m.data.rating_count ?? 0) + 1;
    const newAvg = (((m.data.rating_avg ?? 0) * (m.data.rating_count ?? 0)) + input.rating) / newCount;
    await supabase().from('merchants').update({ rating_count: newCount, rating_avg: Math.round(newAvg * 10) / 10 }).eq('id', input.merchant_id);
  }
  return { ok: true };
}

export async function recordVouchState(merchantSlug: string, targetSlug: string): Promise<boolean> {
  if (!hasSupabase) return false;
  const from = await supabase().from('merchants').select('id').eq('slug', merchantSlug).single();
  const to = await supabase().from('merchants').select('id').eq('slug', targetSlug).single();
  if (!from.data || !to.data) return false;
  const { data } = await supabase().from('vouches').select('id').eq('from_merchant', from.data.id).eq('to_merchant', to.data.id).maybeSingle();
  return Boolean(data);
}

export type { Vouch };
