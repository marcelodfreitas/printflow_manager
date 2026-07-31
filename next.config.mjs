/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.cache = { type: 'memory' };
    return config;
  },
};

export default nextConfig;
