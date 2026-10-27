import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Type-checking is run separately (`npx tsc --noEmit`); skipping it here
  // keeps the build from spawning a worker in restricted sandboxes.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
