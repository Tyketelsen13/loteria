import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Local development configuration
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

  // API routes will be proxied to backend (except auth routes which stay local)
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
    console.log('API Backend URL:', backendUrl) // Debug log
    return [
      // Socket.IO routes - proxy to backend
      {
        source: '/api/socket/:path*',
        destination: `${backendUrl}/api/socket/:path*`,
      },
      // Lobby routes - proxy to backend
      {
        source: '/api/lobbies/:path*',
        destination: `${backendUrl}/api/lobbies/:path*`,
      },
      // Cards routes - proxy to backend
      {
        source: '/api/cards/:path*',
        destination: `${backendUrl}/api/cards/:path*`,
      },
      // User routes - proxy to backend
      {
        source: '/api/users/:path*',
        destination: `${backendUrl}/api/users/:path*`,
      },
      // Profile routes - proxy to backend
      {
        source: '/api/profile/:path*',
        destination: `${backendUrl}/api/profile/:path*`,
      },
      // Note: /api/auth routes are NOT proxied - they stay on frontend for NextAuth.js
    ]
  },

  // Headers for CORS - but only for proxied routes
  async headers() {
    return [
      {
        source: '/api/(socket|lobbies|cards|users|profile)/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3002' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Cookie, next-auth.csrf-token, next-auth.callback-url, next-auth.session-token' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
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
