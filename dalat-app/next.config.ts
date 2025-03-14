import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    domains: ['127.0.0.1', 'localhost', 'firebasestorage.googleapis.com'],
  },
};

export default nextConfig;
