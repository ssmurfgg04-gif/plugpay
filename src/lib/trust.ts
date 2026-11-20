// Recompute a merchant's trust_score from source tables (best-effort).
import { hasSupabase, supabase } from '@/lib/supabase';

export async function recomputeTrust(merchantId: string): Promise<void> {
  if (!hasSupabase) return;
  try {
    const db = supabase();
    const { data: m } = await db.from('merchants').select('verified, ll_phone_verified, sales_count, rating_avg, rating_count, vouches_received, trust_override').eq('id', merchantId).maybeSingle();
    if (!m) return;
    if (m.trust_override != null) return; // admin override wins
    let score = 0;
    if (m.ll_phone_verified) score += 40;
    if (m.verified === 'verified') score += 20;
    score += Math.min(20, Math.floor((m.sales_count ?? 0) / 5));
    score += Math.min(10, Math.round((m.rating_avg ?? 0) * 2));
    score += Math.min(10, m.rating_count ?? 0);
    score += Math.min(10, m.vouches_received ?? 0);
    await db.from('merchants').update({ trust_score: Math.min(100, score) }).eq('id', merchantId);
  } catch {
    // ignore
  }
}
