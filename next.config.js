/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // EdgeOne Pages serves static files directly; disable Next.js image optimization
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
