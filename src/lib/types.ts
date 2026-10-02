// Shared types for PlugPay data.
export interface Building {
  id: string;
  slug: string;
  name: string;
  address: string;
  area: string;
  total_stalls: number;
  registered_merchants: number;
  avg_rating: number;
  coverage_pct: number;
  image_url: string | null;
  verified: boolean;
}

export interface Stall {
  id: string;
  building_id: string;
  floor: string;
  code: string;
  status: 'trusted' | 'verified' | 'basic' | 'unregistered';
  merchant_slug: string | null;
}

export interface Merchant {
  id: string;
  slug: string;
  business_name: string;
  owner_name: string;
  category: string;
  description: string | null;
  building_id: string | null;
  building_name: string | null;
  stall_label: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  verified: 'trusted' | 'verified' | 'basic';
  verified_date: string | null;
  trust_score: number;
  rating_avg: number;
  rating_count: number;
  sales_count: number;
  followers_count: number;
  vouches_received: number;
  mpesa_paybill: string | null;
  mpesa_account: string | null;
  established_year: number | null;
  opening_hours: string | null;
  instagram: string | null;
  tiktok: string | null;
  facebook: string | null;
  claimed: boolean;
}

export interface Product {
  id: string;
  merchant_id: string;
  name: string;
  price_kes: number;
  image_url: string | null;
  stock: number;
  category: string | null;
}

export interface Receipt {
  id: string;
  merchant_id: string;
  receipt_no: string;
  buyer_name: string | null;
  buyer_phone: string | null;
  items: { name: string; qty: number; price: number }[];
  total_kes: number;
  mpesa_code: string | null;
  delivery: 'pickup' | 'runner';
  status: 'pending' | 'settled' | 'cancelled';
  created_at: string;
}

export interface Review {
  id: string;
  merchant_id: string;
  receipt_no: string | null;
  author_name: string;
  author_initials: string | null;
  rating: number;
  body: string;
  verified: boolean;
  created_at: string;
}

export interface Vouch {
  id: string;
  from_merchant: string;
  to_merchant: string;
}

export interface Testimonial {
  id: string;
  name: string;
  initials: string;
  role: string;
  quote: string;
  rating: number;
}

export interface Faq {
  id: string;
  group_name: string;
  question: string;
  answer: string;
  sort: number;
}

export interface PlatformStats {
  verified_merchants: number;
  buildings_mapped: number;
  avg_rating: number;
  gmv_month_kes: number;
}

export interface SearchResult {
  type: 'merchant' | 'building';
  slug: string;
  name: string;
  subtitle: string;
  badge: string;
  rating: number;
  sales: number | null;
  stalls: number | null;
  coverage: number | null;
  avatar_url: string | null;
  initials: string;
  hue: number;
}
