import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  transpilePackages: ["@radix-ui/react-slot"],
  // Turbopack configuration (empty to use defaults)
  turbopack: {},
};

export default nextConfig;
