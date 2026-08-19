import type { NextConfig } from "next";

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
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
      ],
    },
  ],
  webpack: (config) => {
    config.output.hashFunction = "xxhash64";
    return config;
  },
};

export default nextConfig;
