import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://plugpay.co.ke").replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/seller/",
        "/admin",
        "/agent",
        "/landlord",
        "/claim/",
        "/pay/",
        "/r/",
        "/review/",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: BASE + "/sitemap.xml",
  };
}
