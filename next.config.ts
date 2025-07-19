import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
};
module.exports = {
  images: {
    domains: ['dowpig440.wordpress.com'],
  },
    reactStrictMode: true,
  experimental: {
    middleware: true,
  }
}
export default nextConfig;
