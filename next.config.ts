import type { NextConfig } from "next";
import { join } from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Specify the correct root directory to avoid workspace detection issues
  turbopack: {
    root: join(__dirname, ".")
  }
};

export default nextConfig;