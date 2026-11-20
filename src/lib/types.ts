// Shared API response types.

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

// Live app_users row for refresh/me flows.
export interface AppUserRow {
  id: string;
  email: string;
  role: string;
  merchant_slug: string | null;
  landlord_id: string | null;
}
