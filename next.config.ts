import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['asdf'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com", // ✅ Add this
      },

    ],
  },
};

export default nextConfig;
