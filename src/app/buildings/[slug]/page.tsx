import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteNav } from '@/components/landing/SiteNav';
import { SiteFooter } from '@/components/landing/Chrome';
import { FloorMap } from '@/components/buildings/FloorMap';
import { getBuilding, getMerchants, getStalls } from '@/lib/data';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const building = await getBuilding(slug);
  if (!building) return { title: 'Building not found' };
  return {
    title: `${building.name} floor map · ${building.address}`,
    description: `${building.registered_merchants} verified traders across ${building.total_stalls} stalls in ${building.name}, ${building.address}, ${building.area}. Browse the floor map.`,
  };
}

const FLOOR_ORDER = ['Ground', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5'];

export default async function BuildingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const building = await getBuilding(slug);
  if (!building) notFound();

  const [stalls, merchants] = await Promise.all([
    getStalls(building.id),
    getMerchants(),
  ]);

  const registered = merchants.filter((m) => m.building_id === building.id);
  const floors = FLOOR_ORDER.filter((f) => stalls.some((s) => s.floor === f));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: building.name,
    address: { '@type': 'PostalAddress', streetAddress: building.address, addressLocality: building.area, addressCountry: 'KE' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav />
      <main style={{ background: '#f7f8fc', paddingBottom: 64 }}>
        <div className="bldg-hero">
          <div className="bh-inner wrap">
            <div style={{ marginBottom: 10 }}>
              <Link href="/buildings" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>← All buildings</Link>
            </div>
            <h1 className="bh-name">{building.name}</h1>
            <p className="bh-addr">{building.address} · {building.area}</p>
            <div className="bh-stats">
              <div className="bh-stat"><div className="bh-n">{building.registered_merchants}</div><div className="bh-l">Traders</div></div>
              <div className="bh-stat"><div className="bh-n">{building.total_stalls}</div><div className="bh-l">Stalls</div></div>
              <div className="bh-stat"><div className="bh-n">{Number(building.avg_rating).toFixed(1)}★</div><div className="bh-l">Avg rating</div></div>
              <div className="bh-stat"><div className="bh-n">{building.coverage_pct}%</div><div className="bh-l">Coverage</div></div>
            </div>
          </div>
        </div>

        <div className="wrap" style={{ paddingTop: 28 }}>
          <FloorMap floors={floors.length ? floors : ['Ground', 'Floor 1']} stalls={stalls} merchants={merchants} />

          <div className="dash-h" style={{ marginTop: 40, fontSize: 17 }}>Top traders in this building</div>
          {registered.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 13, padding: '16px 0', lineHeight: 1.7 }}>
              No traders registered here yet. Building agents add stalls floor by floor, and each
              stall owner gets a claim link on their WhatsApp.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {registered.map((m) => (
                <Link key={m.id} href={`/m/${m.slug}`} className="bml-item">
                  <span className="bml-av" style={{ background: '#691460' }}>
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt={m.business_name} width={40} height={40} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      m.business_name.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <div className="bml-info">
                    <div className="bml-name">{m.business_name}</div>
                    <div className="bml-sub">{m.category} · {m.stall_label}</div>
                  </div>
                  <div className="bml-right">
                    <div className="bml-stars">{Number(m.rating_avg).toFixed(1)}★</div>
                    <div className="bml-sub" style={{ fontFamily: 'var(--fm)', fontSize: 10.5 }}>{m.trust_score} trust</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
