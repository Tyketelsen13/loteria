import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable Turbopack (recommended over Webpack in newer Next.js)
  turbopack: {
    // Add valid Turbopack options here if needed
  },

  // Production optimizations
  poweredByHeader: false,
  compress: true,
  
  // Skip linting during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // External packages for server components
  serverExternalPackages: [
    'mongoose', 
    'mongodb',
    'bcrypt',
    'canvas'
  ],

  // You can still use other stable settings here
  reactStrictMode: true,
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

  // Webpack configuration to handle potential bundling issues
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle canvas module for server-side rendering
    if (isServer) {
      config.externals.push('canvas')
    }
    
    return config
  },
}

export default nextConfig

