// GET /api/seller/profile-card — render a printable profile card (PDF) for the signed-in seller.
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { jsPDF } from 'jspdf';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'trader' || !session.merchantSlug) {
    return NextResponse.json({ ok: false, error: 'Sign in to your seller account first' }, { status: 401 });
  }
  const { hasSupabase, supabase } = await import('@/lib/supabase');
  if (!hasSupabase) return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });

  const { data: m } = await supabase()
    .from('merchants')
    .select('business_name, owner_name, category, building_name, stall_label, phone, whatsapp, verified, trust_score, rating_avg, rating_count, sales_count')
    .eq('slug', session.merchantSlug)
    .maybeSingle();
  if (!m) return NextResponse.json({ ok: false, error: 'Seller profile missing' }, { status: 404 });

  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  doc.setFillColor(20, 20, 40);
  doc.rect(0, 0, 148, 210, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text(String(m.business_name || 'Seller'), 12, 24);
  doc.setFontSize(11);
  doc.text(String(m.owner_name || ''), 12, 32);
  doc.text(`${m.category || 'Trader'} · ${m.building_name || ''} ${m.stall_label || ''}`.trim(), 12, 40);
  doc.text(`Verified: ${m.verified || 'basic'}`, 12, 52);
  doc.text(`Trust: ${m.trust_score ?? 0}  ·  Rating: ${Number(m.rating_avg ?? 0).toFixed(1)}/5 (${m.rating_count ?? 0})`, 12, 60);
  doc.text(`Sales: ${m.sales_count ?? 0}`, 12, 68);
  if (m.phone) doc.text(`Phone: ${m.phone}`, 12, 78);
  if (m.whatsapp) doc.text(`WhatsApp: ${m.whatsapp}`, 12, 86);
  doc.setFontSize(9);
  doc.text('PlugPay · plugpay.co.ke', 12, 200);

  const buf = doc.output('arraybuffer');
  return new NextResponse(Buffer.from(buf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${session.merchantSlug}-card.pdf"`,
    },
  });
}
