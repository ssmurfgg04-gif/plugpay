import Link from 'next/link';
import { SiteNav } from '@/components/landing/SiteNav';
import { SiteFooter } from '@/components/landing/Chrome';
import { getBuildings } from '@/lib/data';

export const revalidate = 60;

export const metadata = {
  title: 'Verified buildings in Nairobi CBD',
  description: 'Floor maps, registered stalls and verified traders for every PlugPay building in Nairobi CBD.',
};

export default async function BuildingsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const all = await getBuildings();
  const term = (q ?? '').toLowerCase();
  const buildings = term
    ? all.filter((b) => `${b.name} ${b.address}`.toLowerCase().includes(term))
    : all;

  return (
    <>
      <SiteNav />
      <main style={{ background: '#f7f8fc', paddingBottom: 64 }}>
        <div className="bldg-hero">
          <div className="bh-inner wrap">
            <h1 className="bh-name">Verified buildings</h1>
            <p className="bh-addr">Every commercial building on PlugPay comes with a floor map, registered stalls and a trader directory.</p>
            <form action="/buildings" className="nav-search" style={{ width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)' }} role="search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
              <input name="q" defaultValue={q ?? ''} placeholder="Search by name or street" aria-label="Search buildings" />
            </form>
          </div>
        </div>

        <div className="wrap" style={{ paddingTop: 24 }}>
          {buildings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.7 }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>🔍</div>
              <strong style={{ display: 'block', color: 'var(--ink)', marginBottom: 6 }}>No building matches &quot;{q}&quot;</strong>
              Try a street name like Moi Avenue, or{' '}
              <Link href="/buildings" style={{ color: 'var(--red)', fontWeight: 700 }}>view all buildings</Link>.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {buildings.map((b) => (
                <Link key={b.id} href={`/buildings/${b.slug}`} className="res-card">
                  <div style={{ borderRadius: 12, overflow: 'hidden', height: 130, background: '#eef0f7', marginBottom: 12 }}>
                    {b.image_url && (
                      <img src={b.image_url} alt={b.name} loading="lazy" width={300} height={130} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div className="rc-top" style={{ marginBottom: 8 }}>
                    <span className="rc-info">
                      <span className="rc-name">{b.name}</span>
                      <span className="rc-sub" style={{ display: 'block' }}>{b.address} · {b.area}</span>
                      {b.verified && <span className="rc-badge rcb-v">✓ Verified building</span>}
                    </span>
                  </div>
                  <div className="rc-stats">
                    <div className="rcs"><div className="rcs-n">{b.total_stalls}</div><div className="rcs-l">Stalls</div></div>
                    <div className="rcs"><div className="rcs-n">{b.registered_merchants}</div><div className="rcs-l">Traders</div></div>
                    <div className="rcs"><div className="rcs-n">{Number(b.avg_rating).toFixed(1)}★</div><div className="rcs-l">Avg</div></div>
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
