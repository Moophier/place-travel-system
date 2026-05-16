/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Disable SWC due to binary incompatibility in MSYS2/MinGW environment
  experimental: {
    forceSwcTransforms: false,
  },
  webpack: (config, { isServer }) => {
    // Remove all SWC loaders to force Babel fallback
    const swcLoaderNames = ['swc-loader', '@swc/loader', 'next-swc-loader']
    config.module.rules = config.module.rules.map((rule) => {
      if (rule.loader && swcLoaderNames.some((n) => rule.loader.includes(n))) {
        return { test: rule.test, use: [] }
      }
      if (rule.use && Array.isArray(rule.use)) {
        rule.use = rule.use.filter(
          (u) => !swcLoaderNames.some((n) => (u.loader || '').includes(n))
        )
      }
      return rule
    })
    return config
  },
}

module.exports = nextConfig
