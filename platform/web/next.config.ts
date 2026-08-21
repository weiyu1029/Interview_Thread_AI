import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Runtime discovery headers are appended in proxy.ts so framework
     preload links and agent-readable links are both preserved. */
};

export default nextConfig;
