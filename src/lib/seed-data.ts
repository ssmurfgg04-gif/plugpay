// Local fallback mirror of the Supabase seed. Used only when Supabase env
// vars are absent (e.g. cold Netlify preview without env config) so the
// site still renders. Live data flows from the database once configured.
import type { Building, Faq, Merchant, PlatformStats, Product, Review, Stall, Testimonial } from './types';

export const fallbackStats: PlatformStats = {
  verified_merchants: 687,
  buildings_mapped: 12,
  avg_rating: 4.8,
  gmv_month_kes: 12460000,
};

export const fallbackBuildings: Building[] = [
  { id: 'b1', slug: 'anniversary-towers', name: 'Anniversary Towers', address: 'Mama Ngina Street', area: 'Nairobi CBD', total_stalls: 72, registered_merchants: 58, avg_rating: 4.7, coverage_pct: 81, image_url: '/images/bldg-anniversary.jpg', verified: true },
  { id: 'b2', slug: 'kencom-house', name: 'Kencom House', address: 'Moi Avenue', area: 'Nairobi CBD', total_stalls: 84, registered_merchants: 71, avg_rating: 4.8, coverage_pct: 85, image_url: '/images/bldg-kencom.jpg', verified: true },
  { id: 'b3', slug: 'bazaar-plaza', name: 'Bazaar Plaza', address: 'Moi Avenue / Biashara Street', area: 'Nairobi CBD', total_stalls: 96, registered_merchants: 63, avg_rating: 4.6, coverage_pct: 66, image_url: '/images/bldg-bazaar.jpg', verified: true },
  { id: 'b4', slug: 'bihi-towers', name: 'Bihi Towers', address: 'Moi Avenue', area: 'Nairobi CBD', total_stalls: 64, registered_merchants: 39, avg_rating: 4.5, coverage_pct: 61, image_url: '/images/bldg-bihi.jpg', verified: true },
  { id: 'b5', slug: 'jamia-mall', name: 'Jamia Mall', address: 'Kimathi Street', area: 'Nairobi CBD', total_stalls: 88, registered_merchants: 52, avg_rating: 4.7, coverage_pct: 59, image_url: '/images/bldg-jamia.jpg', verified: true },
  { id: 'b6', slug: 'rehema-house', name: 'Rehema House', address: 'Kimathi Street', area: 'Nairobi CBD', total_stalls: 56, registered_merchants: 31, avg_rating: 4.6, coverage_pct: 55, image_url: '/images/bldg-rehema.jpg', verified: true },
];

const merchantRows: Omit<Merchant, 'id'>[] = [
  {
    slug: 'wanjiku-electronics', business_name: 'Wanjiku Electronics', owner_name: 'Jane Wanjiku', category: 'Electronics',
    description: 'We specialize in selling and repairing electronics, computers, and mobile phones. All products come with a 30-day warranty. Delivery available across Kenya on M-Pesa payment.',
    building_id: 'b2', building_name: 'Kencom House', stall_label: 'Floor 3, Stall 12',
    phone: '+254 712 345 678', whatsapp: '+254 712 345 678', avatar_url: '/images/av-wanjiku.jpg', verified: 'trusted', verified_date: '2025-11-14',
    trust_score: 92, rating_avg: 4.8, rating_count: 156, sales_count: 105, followers_count: 235, vouches_received: 3,
    mpesa_paybill: '174379', mpesa_account: null, established_year: 2016, opening_hours: 'Mon - Sat, 8:00am - 6:30pm',
    instagram: '@wanjiku.electronics', tiktok: '@wanjikuelectronics', facebook: '/WanjikuElectronics', claimed: true,
  },
  {
    slug: 'zawadi-fashion-house', business_name: 'Zawadi Fashion House', owner_name: 'Jane Mwangi', category: 'Fashion & Clothing',
    description: 'We stock Ankara fashion, leather bags and handcrafted accessories. Everything is sourced directly from local artisans. M-Pesa accepted. Delivery available across Nairobi.',
    building_id: 'b1', building_name: 'Anniversary Towers', stall_label: 'Floor 3, Stall 14',
    phone: '+254 720 118 442', whatsapp: '+254 720 118 442', avatar_url: '/images/av-mwangi.jpg', verified: 'trusted', verified_date: '2025-09-02',
    trust_score: 88, rating_avg: 4.9, rating_count: 203, sales_count: 312, followers_count: 418, vouches_received: 3,
    mpesa_paybill: '528001', mpesa_account: 'ZAWADI', established_year: 2019, opening_hours: 'Mon - Sat, 8:30am - 6:00pm',
    instagram: '@zawadi.house', tiktok: '@zawadifashion', facebook: '/ZawadiFashionHouse', claimed: true,
  },
  {
    slug: 'grace-beauty-bar', business_name: 'Grace Beauty Bar', owner_name: 'Grace Akinyi', category: 'Beauty & Cosmetics',
    description: 'Original cosmetics, skincare and hair products. We test everything before it reaches the shelf. Wholesale prices for salons in town.',
    building_id: 'b2', building_name: 'Kencom House', stall_label: 'Floor 1, Stall 5',
    phone: '+254 733 260 915', whatsapp: '+254 733 260 915', avatar_url: '/images/av-akinyi.jpg', verified: 'trusted', verified_date: '2026-01-20',
    trust_score: 84, rating_avg: 4.7, rating_count: 98, sales_count: 141, followers_count: 176, vouches_received: 2,
    mpesa_paybill: '802234', mpesa_account: null, established_year: 2021, opening_hours: 'Mon - Sat, 9:00am - 6:00pm',
    instagram: '@gracebeautybar', tiktok: '@gracebeauty254', facebook: '/GraceBeautyBar', claimed: true,
  },
  {
    slug: 'kamau-tech-solutions', business_name: 'Kamau Tech Solutions', owner_name: 'Peter Kamau', category: 'Electronics',
    description: 'Phone repairs, screen replacements and refurbished laptops with a 60-day guarantee. Walk-in or send us a message on WhatsApp and we diagnose remotely.',
    building_id: 'b3', building_name: 'Bazaar Plaza', stall_label: 'Floor 2, Stall 21',
    phone: '+254 726 914 530', whatsapp: '+254 726 914 530', avatar_url: '/images/av-kamau.jpg', verified: 'verified', verified_date: '2026-03-11',
    trust_score: 76, rating_avg: 4.6, rating_count: 74, sales_count: 89, followers_count: 120, vouches_received: 2,
    mpesa_paybill: '610447', mpesa_account: null, established_year: 2018, opening_hours: 'Mon - Sat, 8:00am - 7:00pm',
    instagram: '@kamau.tech', tiktok: null, facebook: null, claimed: true,
  },
  {
    slug: 'mama-nduta-sukuma', business_name: 'Mama Nduta Fresh Produce', owner_name: 'Nduta Wambui', category: 'Food & Groceries',
    description: 'Fresh sukuma, tomatoes, onions and fruits delivered from Limuru every morning. Chagua mwenyewe, we pack for you. Free delivery within CBD for orders above KSh 500.',
    building_id: 'b6', building_name: 'Rehema House', stall_label: 'Ground, Stall G-4',
    phone: '+254 714 882 093', whatsapp: '+254 714 882 093', avatar_url: '/images/av-nduta.jpg', verified: 'verified', verified_date: '2026-02-05',
    trust_score: 71, rating_avg: 4.8, rating_count: 132, sales_count: 268, followers_count: 301, vouches_received: 2,
    mpesa_paybill: null, mpesa_account: null, established_year: 2020, opening_hours: 'Mon - Sat, 6:30am - 5:00pm',
    instagram: '@mamanduta.ke', tiktok: null, facebook: null, claimed: true,
  },
  {
    slug: 'otieno-phone-clinic', business_name: 'Otieno Phone Clinic', owner_name: 'Brian Otieno', category: 'Electronics',
    description: 'Flashing, software fixes and genuine spare parts for all phone models. If we cannot fix it, you do not pay. Data recovery available.',
    building_id: 'b4', building_name: 'Bihi Towers', stall_label: 'Floor 1, Stall 9',
    phone: '+254 799 341 276', whatsapp: '+254 799 341 276', avatar_url: '/images/av-otieno.jpg', verified: 'basic', verified_date: null,
    trust_score: 58, rating_avg: 4.4, rating_count: 41, sales_count: 63, followers_count: 55, vouches_received: 1,
    mpesa_paybill: null, mpesa_account: null, established_year: 2022, opening_hours: 'Mon - Sat, 8:30am - 6:30pm',
    instagram: '@otienoclinic', tiktok: null, facebook: null, claimed: false,
  },
  {
    slug: 'amina-shoes-boutique', business_name: 'Amina Shoes Boutique', owner_name: 'Amina Kibe', category: 'Shoes & Bags',
    description: 'Imported ladies shoes and matching bags. Sizes 36 to 42. We restock every two weeks from Dubai, so what you see on the status is what we have.',
    building_id: 'b1', building_name: 'Anniversary Towers', stall_label: 'Floor 2, Stall 8',
    phone: '+254 738 507 621', whatsapp: '+254 738 507 621', avatar_url: '/images/av-kibe.jpg', verified: 'verified', verified_date: '2026-04-18',
    trust_score: 69, rating_avg: 4.5, rating_count: 67, sales_count: 78, followers_count: 143, vouches_received: 2,
    mpesa_paybill: '903118', mpesa_account: null, established_year: 2023, opening_hours: 'Mon - Sat, 9:00am - 6:00pm',
    instagram: '@amina.shoes', tiktok: '@aminaboutique', facebook: null, claimed: true,
  },
  {
    slug: 'mutua-hardware-centre', business_name: 'Mutua Hardware Centre', owner_name: 'David Mutua', category: 'Hardware & Tools',
    description: 'Power tools, plumbing, electricals and construction materials. Trade prices for fundis and contractors. Ask for the price list on WhatsApp.',
    building_id: 'b5', building_name: 'Jamia Mall', stall_label: 'Floor 2, Stall 5',
    phone: '+254 745 623 190', whatsapp: '+254 745 623 190', avatar_url: '/images/av-mutua.jpg', verified: 'basic', verified_date: null,
    trust_score: 52, rating_avg: 4.3, rating_count: 38, sales_count: 47, followers_count: 40, vouches_received: 1,
    mpesa_paybill: null, mpesa_account: null, established_year: 2017, opening_hours: 'Mon - Sat, 8:00am - 5:30pm',
    instagram: null, tiktok: null, facebook: null, claimed: false,
  },
  {
    slug: 'chebet-stationery-hub', business_name: 'Chebet Stationery Hub', owner_name: 'Faith Chebet', category: 'Stationery',
    description: 'School and office stationery, photocopying, lamination and printing. Bulk discounts for schools. TSC-approved supplier.',
    building_id: 'b6', building_name: 'Rehema House', stall_label: 'Floor 1, Stall 2',
    phone: '+254 721 470 358', whatsapp: '+254 721 470 358', avatar_url: '/images/av-chebet.jpg', verified: 'basic', verified_date: null,
    trust_score: 55, rating_avg: 4.6, rating_count: 52, sales_count: 91, followers_count: 66, vouches_received: 2,
    mpesa_paybill: null, mpesa_account: null, established_year: 2021, opening_hours: 'Mon - Fri, 8:00am - 5:00pm',
    instagram: null, tiktok: null, facebook: null, claimed: false,
  },
  {
    slug: 'kariuki-watch-repairs', business_name: 'Kariuki Watch & Repairs', owner_name: 'Samuel Kariuki', category: 'Accessories & Jewellery',
    description: 'Watch repair, battery replacement, strap fitting and engraving. We also stock original watches from Seiko and Casio. Same-day service.',
    building_id: 'b2', building_name: 'Kencom House', stall_label: 'Floor 4, Stall 8',
    phone: '+254 732 605 487', whatsapp: '+254 732 605 487', avatar_url: '/images/av-kariuki.jpg', verified: 'verified', verified_date: '2026-05-30',
    trust_score: 61, rating_avg: 4.7, rating_count: 45, sales_count: 58, followers_count: 72, vouches_received: 0,
    mpesa_paybill: null, mpesa_account: null, established_year: 2015, opening_hours: 'Mon - Sat, 9:00am - 5:30pm',
    instagram: '@kariuki.watch', tiktok: null, facebook: null, claimed: true,
  },
];

export const fallbackMerchants: Merchant[] = merchantRows.map((m, i) => ({ ...m, id: `m${i + 1}` }));

export const fallbackProducts: Product[] = [
  { id: 'p1', merchant_id: 'm1', name: 'Samsung Galaxy A15', price_kes: 18500, image_url: '/images/pr-phone1.jpg', stock: 4, category: 'Phones' },
  { id: 'p2', merchant_id: 'm1', name: 'Tecno Camon 20', price_kes: 22000, image_url: '/images/pr-phone2.jpg', stock: 3, category: 'Phones' },
  { id: 'p3', merchant_id: 'm1', name: 'HP 250 G8 Laptop', price_kes: 42000, image_url: '/images/pr-laptop1.jpg', stock: 2, category: 'Laptops' },
  { id: 'p4', merchant_id: 'm1', name: 'Dell Inspiron 15', price_kes: 55000, image_url: '/images/pr-laptop2.jpg', stock: 1, category: 'Laptops' },
  { id: 'p5', merchant_id: 'm1', name: 'USB-C Charger 65W', price_kes: 1200, image_url: '/images/pr-charger.jpg', stock: 20, category: 'Accessories' },
  { id: 'p6', merchant_id: 'm1', name: 'Wireless Earbuds', price_kes: 2800, image_url: '/images/pr-earbuds.jpg', stock: 12, category: 'Accessories' },
  { id: 'p7', merchant_id: 'm2', name: 'Ankara Wrap Dress', price_kes: 1800, image_url: '/images/pr-dress.jpg', stock: 8, category: 'Dresses' },
  { id: 'p8', merchant_id: 'm2', name: 'Leather Handbag', price_kes: 3500, image_url: '/images/pr-handbag.jpg', stock: 5, category: 'Bags' },
  { id: 'p9', merchant_id: 'm2', name: 'Beaded Necklace Set', price_kes: 900, image_url: '/images/pr-necklace.jpg', stock: 15, category: 'Jewellery' },
  { id: 'p10', merchant_id: 'm3', name: 'Shea Body Butter 500g', price_kes: 850, image_url: '/images/pr-shea.jpg', stock: 18, category: 'Skincare' },
  { id: 'p11', merchant_id: 'm3', name: 'Matte Lipstick', price_kes: 650, image_url: '/images/pr-lipstick.jpg', stock: 24, category: 'Makeup' },
  { id: 'p12', merchant_id: 'm4', name: 'Refurbished ThinkPad T480', price_kes: 26500, image_url: '/images/pr-thinkpad.jpg', stock: 3, category: 'Laptops' },
  { id: 'p13', merchant_id: 'm4', name: 'Phone Screen Replacement', price_kes: 2500, image_url: '/images/pr-screen.jpg', stock: 30, category: 'Repairs' },
  { id: 'p14', merchant_id: 'm7', name: 'Ladies Sneakers', price_kes: 2900, image_url: '/images/pr-sneakers.jpg', stock: 9, category: 'Shoes' },
  { id: 'p15', merchant_id: 'm7', name: 'Evening Clutch Bag', price_kes: 1500, image_url: '/images/pr-clutch.jpg', stock: 11, category: 'Bags' },
  { id: 'p16', merchant_id: 'm8', name: 'Bosch Cordless Drill', price_kes: 7800, image_url: '/images/pr-drill.jpg', stock: 6, category: 'Power Tools' },
  { id: 'p17', merchant_id: 'm8', name: 'Tool Box Set 108pc', price_kes: 4300, image_url: '/images/pr-toolbox.jpg', stock: 7, category: 'Hand Tools' },
  { id: 'p18', merchant_id: 'm5', name: 'Sukuma Wiki Bunch', price_kes: 20, image_url: '/images/pr-sukuma.jpg', stock: 100, category: 'Vegetables' },
  { id: 'p19', merchant_id: 'm5', name: 'Tomatoes per Kg', price_kes: 90, image_url: '/images/pr-tomatoes.jpg', stock: 60, category: 'Vegetables' },
];

export const fallbackReviews: Review[] = [
  { id: 'r1', merchant_id: 'm1', receipt_no: '#01201', author_name: 'James Kamau', author_initials: 'JK', rating: 5, body: 'Bought a Samsung Galaxy. Genuine product, great price. Comes with the 30-day warranty as promised. Fast delivery too.', verified: true, created_at: '2026-09-30T09:00:00Z' },
  { id: 'r2', merchant_id: 'm1', receipt_no: '#01187', author_name: 'Faith Otieno', author_initials: 'FO', rating: 5, body: 'Best electronics shop in Moi Avenue. Honest seller, original products. Will definitely come back.', verified: true, created_at: '2026-09-24T11:20:00Z' },
  { id: 'r3', merchant_id: 'm1', receipt_no: '#01156', author_name: 'Brian Njoroge', author_initials: 'BN', rating: 4, body: 'Good laptop at a fair price. Would have preferred the original box but overall happy with the purchase.', verified: true, created_at: '2026-09-17T15:40:00Z' },
  { id: 'r4', merchant_id: 'm1', receipt_no: '#00849', author_name: 'Sharon Anyango', author_initials: 'SA', rating: 5, body: 'The seller confirmed my receipt in seconds and even helped me set up the phone. Verified seller badge earned.', verified: true, created_at: '2026-10-01T10:05:00Z' },
  { id: 'r5', merchant_id: 'm2', receipt_no: '#01201', author_name: 'Christine Achieng', author_initials: 'CA', rating: 5, body: 'The Ankara dress fits perfectly and the quality is better than the photos. Receipt came straight to my WhatsApp.', verified: true, created_at: '2026-10-01T08:30:00Z' },
  { id: 'r6', merchant_id: 'm2', receipt_no: '#01187', author_name: 'Naomi Kilonzo', author_initials: 'NK', rating: 5, body: 'Ordered a handbag for my sister in Kisumu, delivery was next morning. Jane is so patient with sizes and colours.', verified: true, created_at: '2026-09-29T14:10:00Z' },
  { id: 'r7', merchant_id: 'm2', receipt_no: '#01156', author_name: 'Dennis Mutiso', author_initials: 'DM', rating: 4, body: 'Nice beaded sets. Packaging could be better but the items themselves are lovely and authentic.', verified: true, created_at: '2026-09-23T12:00:00Z' },
  { id: 'r8', merchant_id: 'm3', receipt_no: '#00912', author_name: 'Winnie Owuor', author_initials: 'WO', rating: 5, body: 'Original shea butter, my skin loves it. She even threw in a free sample of the new lotion.', verified: true, created_at: '2026-09-30T16:45:00Z' },
  { id: 'r9', merchant_id: 'm3', receipt_no: '#00911', author_name: 'Caroline Mumbi', author_initials: 'CM', rating: 4, body: 'Lipsticks are long-lasting. One shade was slightly different from the status photo but still pretty.', verified: true, created_at: '2026-09-27T09:55:00Z' },
  { id: 'r10', merchant_id: 'm5', receipt_no: '#00455', author_name: 'Esther Kilonzo', author_initials: 'EK', rating: 5, body: 'Vegetables arrived fresh and clean, packed nicely. The receipt makes it easy to track my weekly budget.', verified: true, created_at: '2026-10-01T07:20:00Z' },
  { id: 'r11', merchant_id: 'm7', receipt_no: '#00378', author_name: 'Lydia Chelangat', author_initials: 'LC', rating: 5, body: 'Sneakers are exactly as shown, genuine and comfortable. Sizing guidance was spot on.', verified: true, created_at: '2026-09-28T13:35:00Z' },
  { id: 'r12', merchant_id: 'm4', receipt_no: '#00291', author_name: 'John Maina', author_initials: 'JM', rating: 5, body: 'Fixed my screen in one hour and the price was fair. Got a proper receipt too which is rare for repairs.', verified: true, created_at: '2026-09-25T11:15:00Z' },
  { id: 'r13', merchant_id: 'm10', receipt_no: '#00144', author_name: 'Rose Njeri', author_initials: 'RN', rating: 4, body: 'Quick battery replacement and he polished the watch for free. Will bring the other one next week.', verified: true, created_at: '2026-09-22T10:50:00Z' },
];

export const fallbackStalls: Stall[] = [
  { id: 's1', building_id: 'b1', floor: 'Floor 3', code: '3-14', status: 'trusted', merchant_slug: 'zawadi-fashion-house' },
  { id: 's2', building_id: 'b1', floor: 'Floor 2', code: '2-08', status: 'verified', merchant_slug: 'amina-shoes-boutique' },
  { id: 's3', building_id: 'b2', floor: 'Floor 3', code: 'K3-12', status: 'trusted', merchant_slug: 'wanjiku-electronics' },
  { id: 's4', building_id: 'b2', floor: 'Floor 1', code: 'K1-05', status: 'trusted', merchant_slug: 'grace-beauty-bar' },
  { id: 's5', building_id: 'b2', floor: 'Floor 4', code: 'K4-08', status: 'verified', merchant_slug: 'kariuki-watch-repairs' },
  { id: 's6', building_id: 'b3', floor: 'Floor 2', code: '2-21', status: 'verified', merchant_slug: 'kamau-tech-solutions' },
  { id: 's7', building_id: 'b4', floor: 'Floor 1', code: '1-09', status: 'basic', merchant_slug: 'otieno-phone-clinic' },
  { id: 's8', building_id: 'b5', floor: 'Floor 2', code: '2-05', status: 'basic', merchant_slug: 'mutua-hardware-centre' },
  { id: 's9', building_id: 'b6', floor: 'Ground', code: 'G-4', status: 'verified', merchant_slug: 'mama-nduta-sukuma' },
  { id: 's10', building_id: 'b6', floor: 'Floor 1', code: '1-02', status: 'basic', merchant_slug: 'chebet-stationery-hub' },
];

export const fallbackTestimonials: Testimonial[] = [
  { id: 't1', name: 'Wanjiru M.', initials: 'WM', role: 'Fashion seller, Nairobi CBD', quote: 'Buyers used to disappear the moment I asked for payment first. Now they see my badge and pay before I have even finished typing the price.', rating: 5 },
  { id: 't2', name: 'Kevin O.', initials: 'KO', role: 'Phone buyer, Kilimani', quote: 'Someone sent me a fake M-Pesa message last December. With PlugPay I just check the receipt code and I know the sale is real.', rating: 5 },
  { id: 't3', name: 'Mama Grace N.', initials: 'GN', role: 'Groceries, Rehema House', quote: 'My regulars send the receipt link to their friends. I have never advertised, but new customers find me every week.', rating: 5 },
];

export const fallbackFaqs: Faq[] = [
  { id: 'f1', group_name: 'The basics', question: 'What is PlugPay, in one line?', answer: 'PlugPay is trust infrastructure for Nairobi\'s informal traders. It turns years of reputation that used to live only in people\'s memory into something visible, provable and portable. Every verified trader gets a public profile anchored to a real ID, real sales and real peer vouches. That proof travels with them even if the stall, the building or the block changes.', sort: 1 },
  { id: 'f2', group_name: 'The basics', question: 'What\'s actually behind a trader\'s trust score?', answer: 'The platform is built in layers: verified identity, a peer vouching graph, a transaction ledger, public discovery and payments, each one feeding the layer above it. A trust score is not a single input. It is the compounding output of ID verification, landlord confirmation, peer vouches and receipt-anchored reviews. The more of that history a trader has, the harder their profile is to fake.', sort: 2 },
  { id: 'f3', group_name: 'The basics', question: 'Who is PlugPay actually built for?', answer: 'Three groups who currently deal blind. Traders who cannot prove years of honest dealing to a stranger. Buyers who cannot tell a legitimate seller from one who will not be there next month. And landlords whose buildings cannot be marketed on reputation. PlugPay gives each the same underlying proof, just surfaced differently: a profile, a search result, a verified-building badge.', sort: 3 },
  { id: 'f4', group_name: 'How it works', question: 'What can I actually do on PlugPay?', answer: 'Get verified once, then record every sale, and an itemised receipt fires automatically to the buyer on WhatsApp. Fellow traders and your landlord can vouch for you, and buyers can only review a sale that has a real receipt behind it. Your whole track record lives at one shareable link, and delivery runs through a marketplace of verified runners.', sort: 1 },
  { id: 'f5', group_name: 'How it works', question: 'How does an agent onboard a building?', answer: 'An agent signs in with an SMS or email OTP, then sets up an individual landlord account for the building. The landlord can log back into that account later to add more stall owners and complete monthly verification. The agent onboards the building and its stalls, and adds each stall owner\'s details, especially the phone number and email attached to their stall. Each stall owner then gets a claim link and signs up with a WhatsApp OTP, with SMS as a fallback.', sort: 2 },
  { id: 'f6', group_name: 'How it works', question: 'How do I know a receipt is real?', answer: 'Every PlugPay receipt carries a unique confirmation code tied to the sale recorded in the trader\'s ledger. Tap the link or search the code on this site and you will see the exact sale it came from, the trader it belongs to and whether their ID has been verified. Fake M-Pesa screenshots have nowhere to hide when the receipt can be checked in seconds.', sort: 3 },
  { id: 'f7', group_name: 'Pricing & money', question: 'If it\'s free for traders, how does PlugPay make money?', answer: 'Not by charging traders. Verification and unlimited receipts stay free, because the platform gets more valuable the more traders it holds. Revenue comes from the errand and delivery marketplace connecting buyers to verified runners, and from turning trading history into credit data that suppliers and lenders can act on. Traders get verified for free; PlugPay earns once that trust becomes something spendable.', sort: 1 },
  { id: 'f8', group_name: 'Pricing & money', question: 'Does PlugPay hold my money?', answer: 'No. Payments go directly between you and your buyer on M-Pesa, exactly like today. PlugPay records the sale, anchors the receipt and updates your trust profile. We never touch the cash, so there is no float, no delays and nothing extra to lose.', sort: 2 },
];
