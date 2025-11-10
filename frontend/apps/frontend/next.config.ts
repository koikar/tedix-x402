import type { NextConfig } from "next";
import { baseURL } from "@/lib/baseUrl";

const nextConfig: NextConfig = {
  reactCompiler: true,
  assetPrefix: baseURL, // Critical for ChatGPT iframe asset loading
  allowedDevOrigins: [
    "dev.tedi.studio",
    "localhost",
    "dev-mcp.tedi.studio",
    "dev-widget.tedi.studio",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
        pathname: "/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
