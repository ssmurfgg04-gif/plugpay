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
