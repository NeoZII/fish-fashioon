/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Fail the build on type errors instead of shipping broken code silently.
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Fonts read from disk by the share-preview image routes.
  outputFileTracingIncludes: {
    '/item/**': ['./assets/fonts/**'],
  },
}

export default nextConfig
