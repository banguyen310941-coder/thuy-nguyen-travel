import type {MetadataRoute} from 'next';
import {getSiteUrl} from '@/lib/site-url';

export const dynamic='force-static';

export default function robots():MetadataRoute.Robots{
  const base=getSiteUrl();
  return {
    rules:[{
      userAgent:'*',
      allow:['/','/san-pham/','/luu-tru/','/tour-du-lich/','/du-thuyen/','/diem-den','/cam-nang/'],
      disallow:['/admin/','/partner/','/affiliate/','/tai-khoan/','/thanh-toan/','/api/','/tim-kiem','/tour-product','/cam-nang/doc','/account/','/checkout/','/search','/guide/read'],
    }],
    sitemap:`${base}/sitemap.xml`,
    host:base,
  };
}
