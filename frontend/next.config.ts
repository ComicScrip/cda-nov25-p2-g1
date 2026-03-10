import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  transpilePackages: ["@radix-ui/react-slot"],
  // Keep Turbopack scoped to this app instead of auto-detecting a parent workspace.
  turbopack: {
    root: process.cwd(),
  },
  watchOptions: {
    pollIntervalMs: 1000,
  },
};

export default nextConfig;
