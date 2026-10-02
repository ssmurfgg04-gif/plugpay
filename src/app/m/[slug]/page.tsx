import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SiteNav } from '@/components/landing/SiteNav';
import { SiteFooter } from '@/components/landing/Chrome';
import { MerchantTabs } from '@/components/merchant/MerchantTabs';
import { getBuilding, getFaqs, getMerchant, getMerchants, getProducts, getReviews, getStalls } from '@/lib/data';
import { initials } from '@/lib/format';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const merchant = await getMerchant(slug);
  if (!merchant) return { title: 'Trader not found' };
  return {
    title: `${merchant.business_name} · Verified trader profile`,
    description: `${merchant.business_name} (${merchant.category}) in ${merchant.building_name ?? 'Nairobi CBD'}. ${merchant.rating_avg}★ from ${merchant.rating_count} receipt-backed reviews. Trust score ${merchant.trust_score}/100.`,
  };
}

export default async function MerchantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const merchant = await getMerchant(slug);
  if (!merchant) notFound();

  const [products, reviews, building, stalls, allMerchants] = await Promise.all([
    getProducts(merchant.id),
    getReviews(merchant.id, 20),
    merchant.building_id ? getBuildingBySlug(merchant) : Promise.resolve(null),
    merchant.building_id ? getStalls(merchant.building_id) : Promise.resolve([]),
    getMerchants(),
  ]);

  // neighbours in the same building (for the vouch panel)
  const neighbours = merchant.building_id
    ? allMerchants.filter((m) => m.building_id === merchant.building_id && m.slug !== merchant.slug)
    : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: merchant.business_name,
    description: merchant.description ?? '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${merchant.building_name ?? ''} ${merchant.stall_label ?? ''}`.trim(),
      addressLocality: 'Nairobi',
      addressCountry: 'KE',
    },
    telephone: merchant.phone ?? undefined,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: merchant.rating_avg,
      reviewCount: merchant.rating_count,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav />
      <main style={{ background: 'var(--bg-light)' }}>
        <MerchantTabs
          merchant={merchant}
          products={products}
          reviews={reviews}
          building={building}
          stalls={stalls}
          neighbours={neighbours.map((n) => ({ slug: n.slug, business_name: n.business_name, category: n.category, stall_label: n.stall_label, avatar_url: n.avatar_url, rating_avg: Number(n.rating_avg), id: n.id }))}
        />
      </main>
      <SiteFooter />
    </>
  );
}

async function getBuildingBySlug(merchant: { building_id: string | null }) {
  if (!merchant.building_id) return null;
  const { supabase, hasSupabase } = await import('@/lib/supabase');
  if (!hasSupabase) {
    const { fallbackBuildings } = await import('@/lib/seed-data');
    return fallbackBuildings.find((b) => b.id === merchant.building_id) ?? null;
  }
  const { data } = await supabase().from('buildings').select('*').eq('id', merchant.building_id).single();
  return (data as Awaited<ReturnType<typeof getBuilding>>) ?? null;
}
