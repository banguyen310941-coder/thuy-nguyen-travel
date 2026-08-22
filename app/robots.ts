import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/thuy-nguyen-travel/admin/'],
    }],
    sitemap: 'https://banguyen310941-coder.github.io/thuy-nguyen-travel/sitemap.xml',
  };
}
