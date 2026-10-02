import { SiteNav } from '@/components/landing/SiteNav';
import { SiteFooter } from '@/components/landing/Chrome';
import { getBuildings, getMerchants } from '@/lib/data';
import { DiscoverMap, type MapBuilding } from '@/components/map/DiscoverMap';

export const revalidate = 60;

export const metadata = {
  title: 'Explore the map',
  description:
    'Every verified PlugPay building in Nairobi CBD on one live map. Filter by trade, see how many verified traders each building holds, get directions or share on WhatsApp.',
};

export default async function MapPage() {
  const [buildings, merchants] = await Promise.all([getBuildings(), getMerchants()]);

  const spots: MapBuilding[] = buildings
    .filter((b) => b.lat != null && b.lng != null)
    .map((b) => {
      const inside = merchants.filter((m) => m.building_id === b.id);
      const cats = Array.from(new Set(inside.map((m) => m.category).filter(Boolean)));
      return {
        id: b.id,
        slug: b.slug,
        name: b.name,
        address: b.address,
        area: b.area,
        lat: Number(b.lat),
        lng: Number(b.lng),
        image_url: b.image_url,
        stalls: b.total_stalls,
        merchants: inside.length || b.registered_merchants,
        rating: Number(b.avg_rating) || 0,
        verified: Boolean(b.verified),
        categories: cats,
      };
    });

  return (
    <>
      <SiteNav />
      <main>
        <DiscoverMap spots={spots} />
      </main>
      <SiteFooter />
    </>
  );
}
