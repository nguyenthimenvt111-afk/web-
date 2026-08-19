import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Prevents edge runtime issues with bcryptjs (Node.js only module)
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
};

export default nextConfig;
