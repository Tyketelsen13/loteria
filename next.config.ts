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
    'bcrypt',
    'canvas',
    'socket.io'
  ],

  // API routes will be proxied to backend
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    console.log('API Backend URL:', backendUrl) // Debug log
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },

  // Headers for CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark backend-only modules as external
      config.externals.push('bcrypt', 'mongodb', 'mongoose', 'canvas', 'socket.io')
    }
    return config
  },
}

export default nextConfig
