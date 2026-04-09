import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import { serverUrl } from './src/config/server'
import bundleAnalyzer from '@next/bundle-analyzer'

/**
 * Set NEXT_PUBLIC_SERVER_URL to the URL of the server.
 * If NEXT_PUBLIC_SERVER_URL is not set, it will default to the URL of the Vercel deployment.
 * If Vercel URL is not set, it will default to http://localhost:3000.
 */
export const NEXT_PUBLIC_SERVER_URL = serverUrl

const nextConfig: NextConfig = {
  experimental: {
    staticGenerationRetryCount: 1,
    staticGenerationMaxConcurrency: 8,
    staticGenerationMinPagesPerWorker: 25,
    serverActions: {
      bodySizeLimit: '50mb', // Increased for database backup import
    },
  },
  images: {
    qualities: [100, 90, 75],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [128, 256, 384, 480, 640],
    minimumCacheTTL: 60,
    // In dev mode, skip image optimization to avoid loopback timeout
    // (Next.js fetches from its own server which can deadlock)
    ...(process.env.NODE_ENV === 'development' ? { unoptimized: true } : {}),
    remotePatterns: [
      ...[new URL(serverUrl)].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', '') as 'http' | 'https',
        }
      }),
      {
        hostname: '*.vercel.app',
        protocol: 'https',
      },
      {
        hostname: 'cdn.weon.website',
        protocol: 'https',
      },
      {
        hostname: 'cache.apiwow.softsq.com',
        protocol: 'http',
      },
      {
        hostname: '*.b-cdn.net',
        protocol: 'https',
      },
      {
        hostname: 'localtourdemo.b-cdn.net',
        protocol: 'https',
      },
    ],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/intertour',
        destination: '/intertours',
        permanent: true,
      },
      {
        source: '/intertour/:path*',
        destination: '/intertours/:path*',
        permanent: true,
      },
      {
        source: '/tour',
        destination: '/intertours',
        permanent: true,
      },
      {
        source: '/tour/:path*',
        destination: '/intertours/:path*',
        permanent: true,
      },
      {
        source: '/tours',
        destination: '/intertours',
        permanent: true,
      },
      {
        source: '/tours/:path*',
        destination: '/intertours/:path*',
        permanent: true,
      },
    ]
  },
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withPayload(withBundleAnalyzer(nextConfig))
