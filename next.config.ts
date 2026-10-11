import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Netlify's OpenNext adapter provisions its own functions; standalone
  // output is not used there, so it is intentionally left off.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  experimental: {
    // OFF: on the Netlify build the build-time prefetch-hints manifest is not
    // visible to the prerendering runtime, so every shipped page is marked
    // PrefetchHint.InliningHintsStale. The client then expires + re-fetches
    // the route during hydration and React throws a recoverable #418
    // ("Hydration failed ... HTML") on every page — production only, because
    // local `next start` / `netlify serve` can see the manifest. With
    // prefetchInlining disabled the stale-hint path never runs and hydration
    // is byte-stable. Cost: navigations lose the inlined-hint fast path.
    prefetchInlining: false,
  },
};

export default nextConfig;
