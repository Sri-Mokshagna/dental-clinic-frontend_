/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // already skips ESLint errors
  },
  typescript: {
    ignoreBuildErrors: true, // 🚀 this skips TS errors
  },
};

module.exports = nextConfig;
