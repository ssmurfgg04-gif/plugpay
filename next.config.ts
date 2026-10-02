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
};

export default nextConfig;
