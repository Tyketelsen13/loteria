import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Backend-only configuration for Render
  poweredByHeader: false,
  compress: true,
  
  // Skip linting and TypeScript checking for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // External packages for server components
  serverExternalPackages: [
    'mongoose', 
    'mongodb',
    'bcrypt',
    'canvas'
  ],

  // API-only - no frontend routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },

  // CORS configuration for frontend access
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.FRONTEND_URL || 'http://localhost:3000' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ]
  },

  // Webpack configuration for Canvas
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('canvas')
    }
    return config
  },
}

export default nextConfig
