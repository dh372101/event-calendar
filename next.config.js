/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  transpilePackages: [],
  // 确保客户端组件正确处理
  compiler: {
    removeConsole: false,
  },
}

module.exports = nextConfig