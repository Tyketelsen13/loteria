import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Frontend-only configuration for Vercel
  poweredByHeader: false,
  compress: true,
  
  // Skip linting during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // No server-side packages needed for frontend
  reactStrictMode: true,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: '**.imagine.art',
      },
      {
        protocol: 'https',
        hostname: 'imagine.art',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // API routes will be proxied to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
