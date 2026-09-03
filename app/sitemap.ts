import type {MetadataRoute} from 'next';
import {stays,tours,cruises} from '@/data/catalog';
import {guidePosts} from '@/data/guides';
import {getSiteUrl} from '@/lib/site-url';

export const dynamic='force-static';

export default function sitemap():MetadataRoute.Sitemap{
  const base=getSiteUrl();
  const now=new Date();
  const staticPages=[
    ['',1,'daily'],
    ['/stay',.9,'daily'],
    ['/tours',.9,'daily'],
    ['/cruises',.9,'daily'],
    ['/destinations',.85,'weekly'],
    ['/guide',.85,'weekly'],
    ['/about',.5,'monthly'],
    ['/contact',.6,'monthly'],
  ].map(([path,priority,changeFrequency])=>({
    url:`${base}${path}`,
    lastModified:now,
    changeFrequency:changeFrequency as 'daily'|'weekly'|'monthly',
    priority:Number(priority),
  }));

  const detail=(path:string,slug:string)=>({
    url:`${base}/${path}/${slug}`,
    lastModified:now,
    changeFrequency:'weekly' as const,
    priority:.8,
  });

  return [
    ...staticPages,
    ...stays.map(x=>detail('stay',x.slug)),
    ...tours.map(x=>detail('tours',x.slug)),
    ...cruises.map(x=>detail('cruises',x.slug)),
    ...guidePosts.map(x=>({url:`${base}/guide/${x.slug}`,lastModified:now,changeFrequency:'monthly' as const,priority:.75})),
  ];
}
