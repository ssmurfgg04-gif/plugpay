// GET /api/public/seller/[slug] — public, read-only profile payload for one
// merchant, resolved by slug. Powers the public seller profile (modal + page)
// with REAL database rows: merchant profile, catalogue, and receipt-anchored
// reviews. No auth required; returns only public-safe fields.

import { NextRequest, NextResponse } from 'next/server';
import { hasSupabase, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  if (!hasSupabase) {
    return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
  }
  const { slug } = await ctx.params;
  const clean = String(slug || '').trim().toLowerCase();
  if (!clean) {
    return NextResponse.json({ ok: false, error: 'Missing slug' }, { status: 400 });
  }

  try {
    const db = supabase();
    const { data: merchant } = await db
      .from('merchants')
      .select(
        'id, slug, business_name, owner_name, category, role, bio, about, street, building_name, stall_label, phone, whatsapp, instagram, tiktok, facebook, mpesa_paybill, mpesa_account, established_year, verified, trust_score, sales_count, rating_avg, rating_count, vouches_received, avatar_url, email',
      )
      .eq('slug', clean)
      .maybeSingle();

    if (!merchant?.id) {
      return NextResponse.json({ ok: false, error: 'Seller not found' }, { status: 404 });
    }

    const [prodRes, revRes] = await Promise.all([
      db
        .from('products')
        .select('id, name, price_kes, stock, category, image_url')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: true })
        .limit(100),
      db
        .from('reviews')
        .select('author_name, author_initials, rating, body, verified, created_at, receipt_no')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    return NextResponse.json({
      ok: true,
      seller: merchant,
      catalogue: (prodRes.data ?? []).map((p: Record<string, unknown>) => ({
        id: String(p.id),
        name: String(p.name ?? ''),
        price: Number(p.price_kes ?? 0),
        stock: Number(p.stock ?? 0),
        category: String(p.category ?? ''),
        image: String(p.image_url ?? ''),
      })),
      reviews: (revRes.data ?? []).map((r: Record<string, unknown>) => ({
        buyerName: String(r.author_name ?? 'Buyer'),
        initials: String(r.author_initials ?? ''),
        rating: Number(r.rating ?? 0),
        comment: String(r.body ?? ''),
        verified: !!r.verified,
        receiptNo: String(r.receipt_no ?? ''),
        at: String(r.created_at ?? ''),
      })),
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Lookup failed' }, { status: 500 });
  }
}
