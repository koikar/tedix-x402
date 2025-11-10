import type { NextConfig } from "next";
import { baseURL } from "./baseUrl";

const nextConfig: NextConfig = {
  assetPrefix: baseURL,
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
};

export default nextConfig;
