import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
  },
  transpilePackages: ["@radix-ui/react-slot"],
  turbopack: {
    // Avoid workspace-root misdetection when other lockfiles exist above this app.
    root: process.cwd(),
  },
};

export default nextConfig;
