/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: process.env.GITHUB_ACTIONS ? '/thuy-nguyen-travel' : '',
  assetPrefix: process.env.GITHUB_ACTIONS ? '/thuy-nguyen-travel/' : '',
};

export default nextConfig;
