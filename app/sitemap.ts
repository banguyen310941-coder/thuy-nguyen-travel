import type {MetadataRoute} from 'next';
import {stays,tours,cruises} from '@/data/catalog';
import {guidePosts} from '@/data/guides';
import {listPublishedProductSeo} from '@/lib/public-product-seo';
import {getSiteUrl} from '@/lib/site-url';

export const dynamic='force-dynamic';

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const base=getSiteUrl();const now=new Date();
 const staticPages=[['',1,'daily'],['/luu-tru',.9,'daily'],['/tour-du-lich',.9,'daily'],['/du-thuyen',.9,'daily'],['/diem-den',.85,'weekly'],['/cam-nang',.85,'weekly'],['/gioi-thieu',.5,'monthly'],['/lien-he',.6,'monthly'],['/dieu-khoan',.35,'yearly'],['/chinh-sach-bao-mat',.35,'yearly'],['/huong-dan-thanh-toan',.45,'yearly']].map(([path,priority,changeFrequency])=>({url:`${base}${path}`,lastModified:now,changeFrequency:changeFrequency as 'daily'|'weekly'|'monthly'|'yearly',priority:Number(priority)}));
 const detail=(path:string,slug:string)=>({url:`${base}/${path}/${encodeURIComponent(slug)}`,lastModified:now,changeFrequency:'weekly' as const,priority:.8});
 const production=await listPublishedProductSeo();
 return [...staticPages,...production.map(item=>({url:`${base}/san-pham/${encodeURIComponent(item.slug)}`,lastModified:item.updatedAt?new Date(item.updatedAt):now,changeFrequency:'daily' as const,priority:.9})),...stays.map(x=>detail('luu-tru',x.slug)),...tours.map(x=>detail('tour-du-lich',x.slug)),...cruises.map(x=>detail('du-thuyen',x.slug)),...guidePosts.map(x=>({url:`${base}/cam-nang/${encodeURIComponent(x.slug)}`,lastModified:now,changeFrequency:'monthly' as const,priority:.75}))];
}
