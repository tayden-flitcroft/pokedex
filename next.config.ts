import type { NextConfig } from 'next';
const config: NextConfig = {
  agentRules: false,
  output: 'standalone',
  poweredByHeader: false,
  experimental: { staleTimes: { dynamic: 300, static: 3600 } },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/master/sprites/pokemon/**',
        search: '',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    formats: ['image/webp'],
  },
};
export default config;
