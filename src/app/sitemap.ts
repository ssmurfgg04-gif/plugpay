import type { MetadataRoute } from "next";
import { hasSupabase, supabase } from "@/lib/supabase";

// Regenerated at most once an hour; the query is cheap and the content
// (public trust profiles + buildings) changes infrequently.
export const revalidate = 3600;

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://plugpay.co.ke").replace(/\/+$/, "");

// Mirrors src/lib/building.js ppSlug — the client resolves seller/building
// URLs with this exact slugification, so the sitemap must match.
function slugify(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: BASE + "/", changeFrequency: "daily", priority: 1.0 },
    { url: BASE + "/search", changeFrequency: "daily", priority: 0.8 },
    { url: BASE + "/seller-guide", changeFrequency: "monthly", priority: 0.5 },
    { url: BASE + "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
    { url: BASE + "/terms-of-service", changeFrequency: "yearly", priority: 0.2 },
  ];

  if (!hasSupabase) return staticEntries;

  try {
    const db = supabase();
    const [mRes, bRes] = await Promise.all([
      db.from("merchants").select("slug, business_name").limit(1000),
      db.from("buildings").select("slug, name").limit(500),
    ]);

    const sellerEntries: MetadataRoute.Sitemap = (mRes.data ?? [])
      .map((m: Record<string, unknown>) => {
        const slug = String(m.slug ?? "").trim() || slugify(m.business_name);
        return slug ? { url: `${BASE}/sellers/${encodeURIComponent(slug)}`, changeFrequency: "weekly" as const, priority: 0.7 } : null;
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    const buildingEntries: MetadataRoute.Sitemap = (bRes.data ?? [])
      .map((b: Record<string, unknown>) => {
        // The building page resolves by ppSlug(name), not the DB slug.
        const slug = slugify(b.name) || String(b.slug ?? "").trim();
        return slug ? { url: `${BASE}/buildings/${encodeURIComponent(slug)}`, changeFrequency: "weekly" as const, priority: 0.6 } : null;
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    return [...staticEntries, ...sellerEntries, ...buildingEntries];
  } catch {
    // Never break the deploy/revalidation over a sitemap query.
    return staticEntries;
  }
}
