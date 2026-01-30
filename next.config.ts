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
};

export default nextConfig;