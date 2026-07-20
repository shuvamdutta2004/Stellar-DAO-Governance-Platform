/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    
    // Alias native binaries to false so Webpack ignores them and uses pure JS fallbacks
    config.resolve.alias = {
      ...config.resolve.alias,
      'sodium-native': false,
      'require-addon': false,
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }
    return config;
  },
  transpilePackages: ['@stellar/stellar-sdk', '@creit.tech/stellar-wallets-kit'],
};

module.exports = nextConfig;

