import { redirect } from 'next/navigation';
import { SiteNav } from '@/components/landing/SiteNav';
import { SiteFooter } from '@/components/landing/Chrome';
import { DashboardClient } from '@/components/dash/DashboardClient';
import { getSession } from '@/lib/session';
import { hasSupabase, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Your stall dashboard',
  description: 'Record sales, send WhatsApp receipts and watch your trust score grow.',
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/signin');

  let merchant = null;
  if (hasSupabase) {
    const { data } = await supabase()
      .from('merchants')
      .select('slug, business_name, owner_name, category, stall_label, building_name, verified, trust_score, sales_count, rating_count, rating_avg, mpesa_paybill, pin_hash')
      .eq('slug', session.merchantSlug)
      .single();
    merchant = data;
  }

  if (!merchant) {
    return (
      <>
        <SiteNav />
        <main style={{ background: '#f7f8fc', minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 40 }}>
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div className="auth-ico" aria-hidden="true">🛠️</div>
            <h1 className="auth-title">Profile unavailable</h1>
            <p className="auth-sub">
              We could not load your stall because the database is not connected in this preview.
              Set the Supabase environment variables and sign in again.
            </p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteNav />
      <main style={{ background: '#f7f8fc', minHeight: '100dvh', paddingBottom: 64 }}>
        <div className="wrap" style={{ paddingTop: 28 }}>
          <h1 className="pp-h2" style={{ fontSize: 26 }}>Your stall</h1>
          <p className="section-p" style={{ marginBottom: 20 }}>
            Karibu, {merchant.owner_name}. Everything here updates your public trust profile in real time.
          </p>
          <DashboardClient
            merchant={{
              slug: merchant.slug,
              business_name: merchant.business_name,
              owner_name: merchant.owner_name,
              category: merchant.category,
              stall_label: merchant.stall_label,
              building_name: merchant.building_name,
              verified: merchant.verified,
              trust_score: merchant.trust_score ?? 0,
              sales_count: merchant.sales_count ?? 0,
              rating_count: merchant.rating_count ?? 0,
              rating_avg: Number(merchant.rating_avg ?? 0),
              mpesa_paybill: merchant.mpesa_paybill,
              has_pin: Boolean(merchant.pin_hash),
            }}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
