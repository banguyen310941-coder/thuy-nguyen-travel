import type {MetadataRoute} from 'next';
import {getSiteUrl} from '@/lib/site-url';

export const dynamic='force-static';

export default function robots():MetadataRoute.Robots{
  const base=getSiteUrl();
  return {
    rules:[{
      userAgent:'*',
      allow:'/',
      disallow:['/admin/','/partner/','/account/','/checkout/','/api/','/search','/product','/tour-product','/guide/read'],
    }],
    sitemap:`${base}/sitemap.xml`,
    host:base,
  };
}
