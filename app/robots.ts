import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/'] }],
    sitemap: 'https://banguyen310941-coder.github.io/thuy-nguyen-travel/sitemap.xml',
  };
}
