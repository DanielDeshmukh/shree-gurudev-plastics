import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load slug redirects at build time
const redirectsPath = resolve(__dirname, "public/slug-redirects.json");
let slugRedirects: Record<string, string> = {};
try {
  slugRedirects = JSON.parse(readFileSync(redirectsPath, "utf-8"));
} catch {
  // File may not exist yet during initial build
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: [
    "@libsql/client",
    "@libsql/isomorphic-fetch",
    "@libsql/isomorphic-ws",
    "@libsql/hrana-client",
    "@prisma/adapter-libsql",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  redirects: async () =>
    Object.entries(slugRedirects).map(([source, destination]) => ({
      source: `/product/${source}`,
      destination: `/product/${destination}`,
      permanent: true,
    })),
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
            "font-src 'self'",
            "connect-src 'self' https://www.google-analytics.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join("; "),
        },
      ],
    },
  ],
  webpack: (config) => {
    config.output.hashFunction = "xxhash64";
    return config;
  },
};

export default nextConfig;
