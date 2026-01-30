import type { NextConfig } from "next";
import { join } from "path";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  outputFileTracingRoot: __dirname,
  turbopack: {
    // Externalize Prisma for dev mode (Turbopack)
    resolveAlias: {
      '@prisma/client': '@prisma/client',
      '@prisma/engines': '@prisma/engines',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize Prisma to avoid bundling issues
      config.externals = config.externals || [];
      config.externals.push('@prisma/client');
      config.externals.push('@prisma/engines');
    }
    return config;
  },
};

export default nextConfig;