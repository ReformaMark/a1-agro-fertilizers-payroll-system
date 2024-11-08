/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      util: false,
    };

    // Add this to handle the critical dependency warning
    config.externals.push({
        '@tensorflow/tfjs-node': 'commonjs @tensorflow/tfjs-node',
      });
  

    return config;
  },
}

module.exports = nextConfig 