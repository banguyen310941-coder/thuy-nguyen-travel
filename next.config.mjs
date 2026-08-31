/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  // GitHub Pages still needs a static export. Vercel keeps the normal
  // Next.js server runtime so API routes, authentication and database
  // access can be added without changing the public application again.
  ...(isGithubPages ? { output: 'export' } : {}),
  images: { unoptimized: isGithubPages },
  trailingSlash: isGithubPages,
  basePath: isGithubPages ? '/thuy-nguyen-travel' : '',
  assetPrefix: isGithubPages ? '/thuy-nguyen-travel' : '',
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
