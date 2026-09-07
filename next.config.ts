import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Static export of pre-optimized WebP assets; no remote loader needed.
    unoptimized: true,
  },
};

export default nextConfig;
