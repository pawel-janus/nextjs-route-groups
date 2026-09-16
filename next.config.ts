import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Optimized for Docker deployment

  // Uncomment if app is served on a subpath (e.g., https://domain.com/my-app/)
  // basePath: '/my-app',
};

export default nextConfig;
