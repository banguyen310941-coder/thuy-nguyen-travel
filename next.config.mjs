/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isGithubPages ? '/thuy-nguyen-travel' : '',
  // Do not add a trailing slash here. Next already appends /_next/ to assetPrefix.
  assetPrefix: isGithubPages ? '/thuy-nguyen-travel' : '',
};

export default nextConfig;
