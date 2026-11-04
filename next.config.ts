import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.bossperfumes.com',
      },
      {
        protocol: 'https',
        hostname: 'darkorange-newt-323940.hostingersite.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/category/:slug((?!.*\\.(?:webp|jpg|jpeg|png|svg|avif|ico|gif)$).*)',
        destination: '/collections/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
