/** @type {import('next').NextConfig} */
const nextConfig = {
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
