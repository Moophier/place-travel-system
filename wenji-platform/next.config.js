/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cloudflare Pages 需要关闭图片优化
  images: {
    unoptimized: true,
  },
  // 启用 Cloudflare Pages 适配
  trailingSlash: false,
  // 静态导出配置（Cloudflare Pages 会自动处理）
  output: 'standalone',
}

module.exports = nextConfig