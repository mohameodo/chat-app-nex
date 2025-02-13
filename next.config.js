const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  reloadOnOnline: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add redirects to handle 404s
  async redirects() {
    return [
      {
        source: '/@vite/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/src/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/@react-refresh',
        destination: '/',
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/site.webmanifest',
        destination: '/manifest.json',
      },
      {
        source: '/dev-sw.js',
        destination: '/sw.js',
      }
    ]
  },
}

module.exports = withPWA(nextConfig) 