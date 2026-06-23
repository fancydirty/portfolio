import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: false,
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
