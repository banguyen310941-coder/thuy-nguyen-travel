import type {MetadataRoute} from 'next';
import {stays,tours,cruises} from '@/data/catalog';
import {guidePosts} from '@/data/guides';
import {listPublishedProductSeo} from '@/lib/public-product-seo';
import {getSiteUrl} from '@/lib/site-url';

export const dynamic='force-dynamic';

const guideCategories=['flc-sam-son','long-hai','vung-tau','ha-long','du-thuyen','villa-resort','nha-trang','phan-thiet','quy-nhon','tour-trung-quoc'];

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const base=getSiteUrl();
 const staticPages=[['',1,'daily'],['/luu-tru',.9,'daily'],['/tour-du-lich',.9,'daily'],['/du-thuyen',.9,'daily'],['/diem-den',.85,'weekly'],['/cam-nang',.85,'weekly'],['/gioi-thieu',.5,'monthly'],['/lien-he',.6,'monthly'],['/dieu-khoan',.35,'yearly'],['/chinh-sach-bao-mat',.35,'yearly'],['/huong-dan-thanh-toan',.45,'yearly']].map(([path,priority,changeFrequency])=>({url:`${base}${path}`,changeFrequency:changeFrequency as 'daily'|'weekly'|'monthly'|'yearly',priority:Number(priority)}));
 const detail=(path:string,slug:string)=>({url:`${base}/${path}/${encodeURIComponent(slug)}`,changeFrequency:'weekly' as const,priority:.8});
 const production=await listPublishedProductSeo();
 const products=production.map(item=>({url:`${base}/san-pham/${encodeURIComponent(item.slug)}`,...(item.updatedAt?{lastModified:new Date(item.updatedAt)}:{}),changeFrequency:'daily' as const,priority:.9}));
 const categories=guideCategories.map(slug=>({url:`${base}/cam-nang/danh-muc/${slug}`,changeFrequency:'weekly' as const,priority:.7}));
 const guides=guidePosts.map(x=>({url:`${base}/cam-nang/${encodeURIComponent(x.slug)}`,changeFrequency:'monthly' as const,priority:.78}));
 return [...staticPages,...products,...stays.map(x=>detail('luu-tru',x.slug)),...tours.map(x=>detail('tour-du-lich',x.slug)),...cruises.map(x=>detail('du-thuyen',x.slug)),...categories,...guides];
}
