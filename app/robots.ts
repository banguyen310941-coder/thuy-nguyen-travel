import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/thuy-nguyen-travel/admin/',
        '/search',
        '/thuy-nguyen-travel/search',
        '/product',
        '/thuy-nguyen-travel/product',
        '/tour-product',
        '/thuy-nguyen-travel/tour-product',
        '/guide/read',
        '/thuy-nguyen-travel/guide/read',
      ],
    }],
    sitemap: 'https://banguyen310941-coder.github.io/thuy-nguyen-travel/sitemap.xml',
  };
}
