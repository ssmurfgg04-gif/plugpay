// GET /api/bootstrap
// Session-aware hydration payload for the client store.
//  - Signed-in seller → their own receipts, invoices, catalogue, riders, profile.
//  - Signed-in landlord → their own building data.
//  - Anonymous → public directory data only. NO demo merchant is ever injected:
//    every record belongs to the session user or to the public directory.
// If the database is unreachable it returns ok:false and the store keeps its
// (now empty) local state, so the UI never breaks.

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
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

const PALETTE = ['#51104a', '#185FA5', '#D85A30', '#0F7B6C', '#8a8a8a'];

function mapReceipt(r: Record<string, unknown>) {
  return {
    code: String(r.receipt_no ?? ''),
    demo: false,
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
  };
}

function mapInvoice(v: Record<string, unknown>) {
  return {
    token: String(v.token ?? ''),
    number: String(v.number ?? v.token ?? ''),
    demo: false,
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
  };
}

export async function GET() {
  if (!hasSupabase) return NextResponse.json({ ok: false });
  try {
    const db = supabase();
    const session = await getSession();

    // ---- Public directory (same for everyone) -------------------------------
    const [bRes, mRes] = await Promise.all([
      db.from('buildings').select('id, slug, name, address, area, floors, total_stalls, registered_merchants, coverage_pct'),
      db.from('merchants').select('id, slug, business_name, owner_name, category, building_name, stall_label, verified, trust_score, sales_count, rating_avg, rating_count, vouches_received, avatar_url'),
    ]);

    const buildingsRows = bRes.data ?? [];
    const merchantsRows = mRes.data ?? [];

    // ---- Signed-in seller portal data ---------------------------------------
    let seller: Record<string, unknown> | null = null;
    let receipts: ReturnType<typeof mapReceipt>[] = [];
    let invoices: ReturnType<typeof mapInvoice>[] = [];
    let catalogue: Record<string, unknown>[] = [];
    let riders: Record<string, unknown>[] = [];

    if (session?.role === 'trader' && session.merchantSlug) {
      const { data: sellerRow } = await db
        .from('merchants')
        .select('id, slug, business_name, owner_name, email, phone, whatsapp, category, role, bio, about, street, building_name, stall_label, instagram, tiktok, facebook, mpesa_paybill, mpesa_account, established_year, ll_phone_verified, verified, rating_avg, rating_count, sales_count, trust_score')
        .eq('slug', session.merchantSlug)
        .maybeSingle();

      if (sellerRow?.id) {
        seller = sellerRow;
        const [rRes, iRes, pRes, rdRes] = await Promise.all([
          db.from('receipts').select('*').eq('merchant_id', sellerRow.id).order('created_at', { ascending: false }).limit(200),
          db.from('invoices').select('*').eq('merchant_id', sellerRow.id).order('created_at', { ascending: false }).limit(200),
          db.from('products').select('id, name, price_kes, stock, category, image_url').eq('merchant_id', sellerRow.id).order('created_at', { ascending: true }),
          db.from('riders').select('name, role').eq('merchant_slug', sellerRow.slug),
        ]);
        receipts = (rRes.data ?? []).map(mapReceipt);
        invoices = (iRes.data ?? []).map(mapInvoice);
        catalogue = (pRes.data ?? []).map((p: Record<string, unknown>, idx: number) => ({
          id: 'db' + String(p.id ?? idx),
          dbId: String(p.id ?? ''),
          icon: '\u{1F4E6}',
          image: String(p.image_url ?? ''),
          name: String(p.name ?? ''),
          price: String(Number(p.price_kes ?? 0)),
          category: String(p.category ?? 'General'),
          stock: Number(p.stock ?? 0),
        }));
        riders = (rdRes.data ?? []).map((r: Record<string, unknown>, i: number) => ({
          id: 'r' + i,
          name: String(r.name ?? ''),
          role: String(r.role ?? 'Rider'),
        }));
      }
    }

    // ---- Claims: only for signed-in agents (their worklist) ------------------
    let claims: Record<string, unknown>[] = [];
    if (session?.role === 'agent') {
      const { data: cRes } = await db.from('claims').select('*').order('created_at', { ascending: false }).limit(200);
      claims = (cRes ?? []).map((c: Record<string, unknown>) => ({
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
    }

    // ---- Landlord data: only the signed-in landlord's own account ------------
    let lbAccounts: Record<string, unknown>[] = [];
    let lbData: Record<string, Record<string, unknown>> = {};
    if (session?.role === 'landlord') {
      let nameFilter: string | null = null;
      if (session.landlordId) {
        const { data: acc } = await db
          .from('landlord_accounts')
          .select('id, client_id, name, street, total_stalls')
          .eq('id', session.landlordId)
          .maybeSingle();
        if (acc?.name) {
          lbAccounts = [
            {
              id: String(acc.client_id ?? acc.id),
              name: String(acc.name ?? ''),
              street: String(acc.street ?? 'Nairobi CBD'),
              totalStalls: Number(acc.total_stalls ?? 0),
            },
          ];
          nameFilter = String(acc.name ?? '');
        }
      }
      if (nameFilter) {
        const [stRes, cRes] = await Promise.all([
          db.from('stalls').select('building_id, floor, code, status').limit(2000),
          db.from('claims').select('client_id, business_name, loc, category, building_name, draft, verified, status').limit(500),
        ]);
        const stallsRows = stRes.data ?? [];
        const claimsRows = cRes.data ?? [];
        const bRow = buildingsRows.find(
          (b: Record<string, unknown>) => String(b.name ?? '').toLowerCase() === nameFilter!.toLowerCase(),
        );
        const inBuilding = merchantsRows.filter(
          (m: Record<string, unknown>) => String(m.building_name ?? '').toLowerCase() === nameFilter!.toLowerCase(),
        );
        const verified = inBuilding.map((m: Record<string, unknown>, i: number) => ({
          id: String(m.slug ?? i),
          name: String(m.business_name ?? ''),
          sub: `${String(m.category ?? 'General')} \u00B7 ${String(m.stall_label ?? 'Stall TBD')}`,
          initials: initials(String(m.business_name ?? '')),
          color: PALETTE[i % PALETTE.length],
        }));
        const pending = claimsRows
          .filter(
            (c: Record<string, unknown>) =>
              String(c.building_name ?? '').toLowerCase() === nameFilter!.toLowerCase() &&
              !c.draft &&
              !c.verified,
          )
          .map((c: Record<string, unknown>, i: number) => ({
            id: String(c.client_id ?? i),
            name: String(c.business_name ?? ''),
            sub: `Claims ${String(c.loc ?? '')} \u00B7 ${String(c.category ?? '')}`,
            initials: initials(String(c.business_name ?? '')),
            color: '#8a8a8a',
          }));
        const vacant = stallsRows
          .filter((s: Record<string, unknown>) => s.status === 'vacant' && bRow && s.building_id === bRow.id)
          .map((s: Record<string, unknown>) => {
            const floor = String(s.floor ?? '');
            return {
              id: `v-${String(s.code ?? Math.random())}`,
              label: `${floor === 'G' || floor === '0' ? 'Ground Floor' : 'Floor ' + floor}, Stall ${String(s.code ?? '')}`,
            };
          });
        const accountId = lbAccounts[0]?.id ?? 'll';
        lbData[accountId] = {
          pending,
          verified,
          vacated: [],
          vacant,
          onPlugPay: inBuilding.length,
        };
      }
    }

    // ---- Directory views ------------------------------------------------------
    const directorySellers = merchantsRows.map((m: Record<string, unknown>, i: number) => ({
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

    return NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      session: session
        ? { email: session.email, role: session.role, merchantSlug: session.merchantSlug }
        : null,
      seller,
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
