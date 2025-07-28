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

  // Middleware handles CORS configuration
  // See src/middleware.ts for CORS setup

  // Webpack configuration for Canvas
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('canvas')
    }
    return config
  },
}

export default nextConfig
