import { NextRequest, NextResponse } from 'next/server';
import { searchAll } from '@/lib/data';
import { hueFromString, initials } from '@/lib/format';
import type { SearchResult } from '@/lib/types';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!q) return NextResponse.json({ results: [] });

  try {
    const { merchants, buildings } = await searchAll(q);
    const results: SearchResult[] = [
      ...merchants.map((m) => ({
        type: 'merchant' as const,
        slug: m.slug,
        name: m.business_name,
        subtitle: `${m.category} · ${m.building_name ?? 'Nairobi CBD'} · ${m.stall_label ?? ''}`,
        badge: m.verified === 'trusted' ? 'Trusted' : m.verified === 'verified' ? 'Verified' : 'Basic',
        rating: Number(m.rating_avg) || 0,
        sales: m.sales_count,
        stalls: null,
        coverage: null,
        avatar_url: m.avatar_url,
        initials: initials(m.business_name),
        hue: hueFromString(m.slug),
      })),
      ...buildings.map((b) => ({
        type: 'building' as const,
        slug: b.slug,
        name: b.name,
        subtitle: `${b.address} · ${b.area}`,
        badge: 'Building',
        rating: Number(b.avg_rating) || 0,
        sales: null,
        stalls: b.total_stalls,
        coverage: b.coverage_pct,
        avatar_url: b.image_url,
        initials: initials(b.name),
        hue: hueFromString(b.slug),
      })),
    ];
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], error: 'Search unavailable right now' }, { status: 200 });
  }
}
