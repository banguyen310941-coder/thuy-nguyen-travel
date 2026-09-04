import type {MetadataRoute} from 'next';
import {getSiteUrl} from '@/lib/site-url';

export const dynamic='force-static';

export default function robots():MetadataRoute.Robots{
  const base=getSiteUrl();
  return {
    rules:[{
      userAgent:'*',
      allow:['/','/product/'],
      disallow:['/admin/','/partner/','/affiliate/','/account/','/checkout/','/api/','/search','/tour-product','/guide/read'],
    }],
    sitemap:`${base}/sitemap.xml`,
    host:base,
  };
}
