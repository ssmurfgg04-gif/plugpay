// GET /api/bootstrap
// One-shot hydration payload for the client store. Maps the portal tables
// (receipts, invoices, products, claims, landlord_accounts, stalls, merchants,
// riders) onto the exact shapes the PlugPayProvider store expects. If the
// database is unreachable it returns ok:false and the store keeps its bundled
// demo data, so the UI never breaks.

import { NextResponse } from 'next/server';
import { hasSupabase, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function initials(name: string): string {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

function hue(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return `hsl(${h}, 62%, 42%)`;
}

const PALETTE = ['#51104a', '#185FA5', '#D85A30', '#0F7B6C', '#8a8a8a'];

export async function GET() {
  if (!hasSupabase) return NextResponse.json({ ok: false });
  try {
    const db = supabase();

    const { data: seller } = await db
      .from('merchants')
      .select('id, slug, business_name, owner_name, phone, whatsapp, category, role, bio, about, street, building_name, stall_label, instagram, tiktok, facebook, mpesa_paybill, mpesa_account, established_year, ll_phone_verified')
      .eq('slug', 'wanjiku-electronics')
      .maybeSingle();

    if (!seller?.id) return NextResponse.json({ ok: false });

    const [rRes, iRes, pRes, cRes, lbRes, stRes, mRes, rdRes] = await Promise.all([
      db.from('receipts').select('*').eq('merchant_id', seller.id).order('created_at', { ascending: false }),
      db.from('invoices').select('*').eq('merchant_id', seller.id).order('created_at', { ascending: false }),
      db.from('products').select('id, name, price_kes, stock, category').eq('merchant_id', seller.id).order('created_at', { ascending: true }),
      db.from('claims').select('*').order('created_at', { ascending: false }),
      db.from('landlord_accounts').select('*').order('created_at', { ascending: true }),
      db.from('stalls').select('building_id, floor, code, status, merchant_slug'),
      db.from('merchants').select('id, slug, business_name, owner_name, category, building_name, stall_label, verified, trust_score, sales_count, rating_avg, rating_count, vouches_received, avatar_url'),
      db.from('riders').select('name, role').eq('merchant_slug', seller.slug),
    ]);

    const bRes = await db.from('buildings').select('id, slug, name, address, area, floors, total_stalls, registered_merchants, coverage_pct');

    const receipts = (rRes.data ?? []).map((r: Record<string, unknown>) => ({
      code: String(r.receipt_no ?? ''),
      demo: !!r.demo,
      buyerName: String(r.buyer_name ?? ''),
      buyerPhone: String(r.buyer_phone ?? ''),
      paymentRef: String(r.mpesa_code ?? ''),
      items: (Array.isArray(r.items) ? r.items : []).map((it: Record<string, number | string>) => ({
        name: String(it.name ?? ''),
        qty: Number(it.qty ?? 1),
        unit: Number(it.unit ?? it.price ?? 0),
        price: Number(it.price ?? 0),
        productId: String(it.productId ?? ''),
        category: String(it.category ?? ''),
      })),
      total: Number(r.total_kes ?? 0),
      createdAt: String(r.created_at ?? ''),
      sentAt: r.sent_at ? String(r.sent_at) : null,
      stockApplied: !!r.stock_applied,
      review: (r.review as Record<string, unknown>) ?? null,
      docStatus: String(r.doc_status ?? 'COMPLETE'),
    }));

    const invoices = (iRes.data ?? []).map((v: Record<string, unknown>) => ({
      token: String(v.token ?? ''),
      number: String(v.number ?? v.token ?? ''),
      demo: !!v.demo,
      buyerName: String(v.buyer_name ?? ''),
      buyerPhone: String(v.buyer_phone ?? ''),
      source: String(v.source ?? 'WhatsApp'),
      items: (Array.isArray(v.items) ? v.items : []).map((it: Record<string, number | string>) => ({
        name: String(it.name ?? ''),
        qty: Number(it.qty ?? 1),
        unit: Number(it.unit ?? it.price ?? 0),
        price: Number(it.price ?? 0),
        productId: String(it.productId ?? ''),
        category: String(it.category ?? ''),
      })),
      total: Number(v.total ?? 0),
      status: String(v.status ?? 'PENDING'),
      docStatus: String(v.doc_status ?? 'COMPLETE'),
      createdAt: String(v.created_at ?? ''),
    }));

    const catalogue = (pRes.data ?? []).map((p: Record<string, unknown>, idx: number) => ({
      id: 'db' + String(p.id ?? idx),
      icon: '\u{1F4E6}',
      image: '',
      name: String(p.name ?? ''),
      price: String(Number(p.price_kes ?? 0)),
      category: String(p.category ?? 'General'),
      stock: Number(p.stock ?? 0),
    }));

    const claims = (cRes.data ?? []).map((c: Record<string, unknown>) => ({
      id: String(c.client_id ?? c.token ?? ''),
      token: String(c.token ?? ''),
      businessName: String(c.business_name ?? ''),
      ownerName: String(c.owner_name ?? ''),
      phone: String(c.phone ?? ''),
      category: String(c.category ?? ''),
      floor: String(c.floor ?? ''),
      number: String(c.number ?? ''),
      loc: String(c.loc ?? ''),
      buildingName: String(c.building_name ?? ''),
      status: String(c.status ?? 'INVITED'),
      verified: !!c.verified,
      source: String(c.source ?? 'agent'),
      draft: !!c.draft,
      createdAt: String(c.created_at ?? ''),
      sentAt: c.sent_at ? String(c.sent_at) : null,
      claimedAt: c.claimed_at ? String(c.claimed_at) : null,
    }));

    const buildingsRows = bRes.data ?? [];
    const merchantsRows = mRes.data ?? [];
    const stallsRows = stRes.data ?? [];
    const bId = new Map(buildingsRows.map((b: Record<string, unknown>) => [b.id, b]));

    const lbAccounts = (lbRes.data ?? []).map((a: Record<string, unknown>) => ({
      id: String(a.client_id ?? a.name ?? ''),
      name: String(a.name ?? ''),
      street: String(a.street ?? 'Nairobi CBD'),
      totalStalls: Number(a.total_stalls ?? 0),
    }));

    const lbData: Record<string, unknown> = {};
    for (const a of lbAccounts) {
      const inBuilding = merchantsRows.filter(
        (m: Record<string, unknown>) =>
          String(m.building_name ?? '').toLowerCase() === a.name.toLowerCase(),
      );
      const verified = inBuilding.map((m: Record<string, unknown>, i: number) => ({
        id: String(m.slug ?? i),
        name: String(m.business_name ?? ''),
        sub: `${String(m.category ?? 'General')} \u00B7 ${String(m.stall_label ?? 'Stall TBD')}`,
        initials: initials(String(m.business_name ?? '')),
        color: PALETTE[i % PALETTE.length],
      }));
      const pending = (cRes.data ?? [])
        .filter(
          (c: Record<string, unknown>) =>
            String(c.building_name ?? '').toLowerCase() === a.name.toLowerCase() &&
            !c.draft &&
            !c.verified,
        )
        .map((c: Record<string, unknown>) => ({
          id: String(c.client_id ?? c.token ?? ''),
          name: String(c.business_name ?? ''),
          sub: `Claims ${String(c.loc ?? '')} \u00B7 ${String(c.category ?? '')}`,
          initials: initials(String(c.business_name ?? '')),
          color: '#8a8a8a',
        }));
      const bRow = buildingsRows.find(
        (b: Record<string, unknown>) => String(b.name ?? '').toLowerCase() === a.name.toLowerCase(),
      );
      const vacant = stallsRows
        .filter(
          (s: Record<string, unknown>) =>
            s.status === 'vacant' && bRow && s.building_id === bRow.id,
        )
        .map((s: Record<string, unknown>) => {
          const floor = String(s.floor ?? '');
          return {
            id: `v-${String(s.code ?? Math.random())}`,
            label: `${floor === 'G' || floor === '0' ? 'Ground Floor' : 'Floor ' + floor}, Stall ${String(s.code ?? '')}`,
          };
        });
      lbData[a.id] = {
        pending,
        verified,
        vacated: [],
        vacant,
        onPlugPay: inBuilding.length,
      };
    }

    const directorySellers = merchantsRows
      .filter((m: Record<string, unknown>) => String(m.slug ?? '') !== seller.slug)
      .map((m: Record<string, unknown>, i: number) => ({
        type: 'merchant',
        name: String(m.business_name ?? ''),
        sub: `${String(m.category ?? 'General')} \u00B7 ${String(m.building_name ?? 'Nairobi CBD')} \u00B7 ${String(m.stall_label ?? '')}`,
        initials: initials(String(m.business_name ?? '')),
        color: PALETTE[i % PALETTE.length],
        badge:
          String(m.verified ?? '') === 'trusted'
            ? 'Trusted'
            : String(m.verified ?? '') === 'verified'
              ? 'Verified'
              : 'Basic',
        badgeClass:
          String(m.verified ?? '') === 'trusted'
            ? 'rcb-trusted'
            : String(m.verified ?? '') === 'verified'
              ? 'rcb-verified'
              : 'rcb-basic',
        rating: String(m.rating_avg ?? '0'),
        sales: Number(m.sales_count ?? 0),
        reviews: Number(m.rating_count ?? 0),
        vouches: Number(m.vouches_received ?? 0),
      }));

    const directoryBuildings = buildingsRows.map((b: Record<string, unknown>) => ({
      type: 'building',
      name: String(b.name ?? ''),
      street: String(b.address ?? ''),
      sub: `${String(b.address ?? '')} \u00B7 ${Number(b.floors ?? 0)} floors \u00B7 ${Number(b.total_stalls ?? 0)} stalls \u00B7 ${Number(b.registered_merchants ?? 0)} registered`,
      floors: Number(b.floors ?? 0),
      stalls: Number(b.total_stalls ?? 0),
      registered: Number(b.registered_merchants ?? 0),
      pct: Number(b.coverage_pct ?? 0),
    }));

    const riders = (rdRes.data ?? []).map((r: Record<string, unknown>, i: number) => ({
      id: 'r' + i,
      name: String(r.name ?? ''),
      role: String(r.role ?? 'Rider'),
    }));

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      seller: seller,
      receipts,
      invoices,
      catalogue,
      claims,
      lbAccounts,
      lbData,
      directorySellers,
      directoryBuildings,
      riders,
      buildingsIndex: buildingsRows.map((b: Record<string, unknown>) => ({
        slug: String(b.slug ?? ''),
        name: String(b.name ?? ''),
      })),
    });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
