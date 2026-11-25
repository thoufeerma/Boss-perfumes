import type { NextConfig } from "next";

// Sent on every response. Deliberately no script-src / style-src policy: the storefront
// loads Tabby, Paymob, Nomod and font scripts whose hosts change, and a wrong allowlist
// would break checkout. These headers block clickjacking, MIME sniffing, plugin content
// and <base> hijacking, and keep browsers on HTTPS.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // Serve images straight from WordPress / public instead of Vercel's Image
    // Optimization, whose monthly allowance ran out (every /_next/image request
    // returned 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED and no photos showed).
    unoptimized: true,
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
