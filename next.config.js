/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow reading from the data directory (legacy — kept for reference)
  serverRuntimeConfig: {
    dataDir: './data',
  },
};

module.exports = nextConfig;

// Cloudflare next-on-pages: enable dev bindings
if (process.env.NODE_ENV === 'development') {
  const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');
  setupDevPlatform().catch(console.error);
}
