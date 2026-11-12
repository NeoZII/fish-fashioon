/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Fail the build on type errors instead of shipping broken code silently.
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
