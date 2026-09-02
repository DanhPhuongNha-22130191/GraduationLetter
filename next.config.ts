import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Allow easy local SVG / external image loading
  },
};

export default nextConfig;
