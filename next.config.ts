import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/chatbot',
  trailingSlash: true,
  allowedDevOrigins: ['https://murata-coworker-dev.macp.murata.com'],
};

export default nextConfig;
