import Link from 'next/link';
import { SiteNav } from '@/components/landing/SiteNav';
import { SiteFooter } from '@/components/landing/Chrome';
import { getBuildings, getMerchants } from '@/lib/data';

export const revalidate = 60;

export const metadata = {
  title: 'Landlord tools',
  description: 'Monthly verification, stall occupancy and trader vouches for PlugPay buildings.',
};

export default async function LandlordPage() {
  const [buildings, merchants] = await Promise.all([getBuildings(), getMerchants()]);

  return (
    <>
      <SiteNav />
      <main style={{ background: '#f7f8fc', minHeight: '100dvh', paddingBottom: 64 }}>
        <div className="bldg-hero">
          <div className="bh-inner wrap">
            <h1 className="bh-name">Landlord tools</h1>
            <p className="bh-addr">
              A building that trades on reputation leases faster. Confirm your stalls monthly and
              your traders keep the landlord-confirmed badge buyers trust.
            </p>
          </div>
        </div>

        <div className="wrap" style={{ paddingTop: 28 }}>
          <div className="dash-card">
            <h2 className="dash-h" style={{ fontSize: 17 }}>Occupancy at a glance</h2>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 16 }}>
              Each row is a PlugPay building. Coverage is the share of stalls whose owners have
              claimed their profile. Landlord confirmation is the final rung of the verification
              ladder, above ID and selfie checks.
            </p>
            <div style={{ display: 'grid', gap: 10 }}>
              {buildings.map((b) => {
                const here = merchants.filter((m) => m.building_id === b.id);
                const trusted = here.filter((m) => m.verified === 'trusted').length;
                return (
                  <div key={b.id} className="doc-card" style={{ flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 20 }}>🏢</span>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{b.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                        {b.address} · {b.registered_merchants}/{b.total_stalls} stalls registered · {trusted} landlord-confirmed
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="doc-ok">{b.coverage_pct}% coverage</span>
                      <Link href={`/buildings/${b.slug}`} className="rf" style={{ textDecoration: 'none' }}>Floor map</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dash-card" style={{ marginTop: 16 }}>
            <h2 className="dash-h" style={{ fontSize: 17 }}>How onboarding works</h2>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {[
                ['1 · The agent maps the building', 'An agent signs in and registers the building with its floors and stall grid.'],
                ['2 · Stall owners get a claim link', 'Each stall owner receives a WhatsApp message with a claim link tied to their stall.'],
                ['3 · Traders verify once', 'ID, selfie liveness and stall details. Verified within 24 hours by the PlugPay team.'],
                ['4 · You confirm monthly', 'Confirm occupancy each month so your traders keep the landlord-confirmed badge.'],
              ].map(([t, d]) => (
                <div key={t} className="f-card">
                  <div className="f-t" style={{ fontSize: 13.5 }}>{t}</div>
                  <div className="f-d" style={{ fontSize: 12.5 }}>{d}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16, lineHeight: 1.7 }}>
              Are you an agent onboarding a building? <Link href="/signin" style={{ color: 'var(--red)', fontWeight: 700 }}>Sign in here</Link> to
              open the landlord account for your building.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
