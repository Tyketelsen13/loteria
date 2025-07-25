import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // API-only backend configuration for Render
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

  // CORS configuration for frontend access
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
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
