import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'darkorange-newt-323940.hostingersite.com',
      },
    ],
  },
};

export default nextConfig;
