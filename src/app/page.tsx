import { SiteNav } from '@/components/landing/SiteNav';
import { Hero } from '@/components/landing/Hero';
import { WhatsAppDemo } from '@/components/landing/WhatsAppDemo';
import { Friction, Breakthrough } from '@/components/landing/FrictionBreakthrough';
import { Contrast, Pricing } from '@/components/landing/ContrastPricing';
import { Voices } from '@/components/landing/Voices';
import { Market, Faq } from '@/components/landing/MarketFaq';
import { MerchantCta, SiteFooter } from '@/components/landing/Chrome';
import { getFaqs, getStats, getTestimonials } from '@/lib/data';

export const revalidate = 60;

export default async function HomePage() {
  const [stats, testimonials, faqs] = await Promise.all([getStats(), getTestimonials(), getFaqs()]);

  return (
    <>
      <SiteNav />
      <main>
        <Hero stats={stats} />
        <WhatsAppDemo />
        <Friction />
        <Breakthrough />
        <Contrast />
        <Pricing />
        <Voices testimonials={testimonials} />
        <Market />
        <Faq faqs={faqs} />
        <MerchantCta />
      </main>
      <SiteFooter />
    </>
  );
}
