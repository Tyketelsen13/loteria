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

  // External packages that should not be bundled
  serverExternalPackages: [
    'mongoose', 
    'mongodb',
    'bcrypt'
  ],

  // API routes will be proxied to backend
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark backend-only modules as external
      config.externals.push('bcrypt', 'mongodb', 'mongoose')
    }
    return config
  },
}

export default nextConfig
