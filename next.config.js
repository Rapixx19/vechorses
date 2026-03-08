/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Handle framer-motion and other ESM packages
  transpilePackages: ["framer-motion"],

  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
}

module.exports = nextConfig
