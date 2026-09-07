import type {MetadataRoute} from 'next';
import {stays,tours,cruises} from '@/data/catalog';
import {guidePosts} from '@/data/guides';
import {guideCategories} from '@/data/guideCategories';
import {seoDestinations} from '@/data/seo-destinations';
import {listPublishedProductSeo} from '@/lib/public-product-seo';
import {listPublishedTourSeo} from '@/lib/public-tour-seo';
import {listPublishedGuideSeo} from '@/lib/public-guide-seo';
import {getSiteUrl} from '@/lib/site-url';

export const dynamic='force-dynamic';

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const base=getSiteUrl();
 const staticPages=[['',1,'daily'],['/luu-tru',.9,'daily'],['/villa-resort',.92,'daily'],['/khach-san',.92,'daily'],['/tour-du-lich',.9,'daily'],['/du-thuyen',.9,'daily'],['/diem-den',.9,'weekly'],['/cam-nang',.85,'weekly'],['/gioi-thieu',.5,'monthly'],['/lien-he',.6,'monthly'],['/dieu-khoan',.35,'yearly'],['/chinh-sach-bao-mat',.35,'yearly'],['/huong-dan-thanh-toan',.45,'yearly']].map(([path,priority,changeFrequency])=>({url:`${base}${path}`,changeFrequency:changeFrequency as 'daily'|'weekly'|'monthly'|'yearly',priority:Number(priority)}));
 const detail=(path:string,slug:string)=>({url:`${base}/${path}/${encodeURIComponent(slug)}`,changeFrequency:'weekly' as const,priority:.8});
 const [production,productionTours,productionGuides]=await Promise.all([listPublishedProductSeo(),listPublishedTourSeo(),listPublishedGuideSeo()]);
 const products=production.map(item=>({url:`${base}/${item.type==='Du thuyền'?'du-thuyen':'san-pham'}/${encodeURIComponent(item.slug)}`,...(item.updatedAt&&Number.isFinite(+new Date(item.updatedAt))?{lastModified:new Date(item.updatedAt)}:{}),changeFrequency:'daily' as const,priority:.9}));
 const productionCruiseSlugs=new Set(production.filter(item=>item.type==='Du thuyền').map(item=>item.slug));
 const staticTourSlugs=new Set(tours.map(item=>item.slug));
 const cmsTours=productionTours.filter(item=>!staticTourSlugs.has(item.slug)).map(item=>({url:`${base}/tour-du-lich/${encodeURIComponent(item.slug)}`,...(item.updatedAt&&Number.isFinite(+new Date(item.updatedAt))?{lastModified:new Date(item.updatedAt)}:{}),changeFrequency:'weekly' as const,priority:.82}));
 const cmsGuideSlugs=new Set(productionGuides.map(item=>item.slug));
 const cmsGuides=productionGuides.map(item=>({url:`${base}/cam-nang/${encodeURIComponent(item.slug)}`,...(item.updatedAt&&Number.isFinite(+new Date(item.updatedAt))?{lastModified:new Date(item.updatedAt)}:{}),changeFrequency:'weekly' as const,priority:.78}));
 const categories=guideCategories.map(category=>({url:`${base}/cam-nang/danh-muc/${category.slug}`,changeFrequency:'weekly' as const,priority:.7}));
 const destinationSlugs=[...seoDestinations.map(item=>item.slug),'long-hai','vung-tau'];
 const destinations=destinationSlugs.map(slug=>({url:`${base}/diem-den/${slug}`,changeFrequency:'weekly' as const,priority:.85}));
 const guides=guidePosts.filter(item=>!cmsGuideSlugs.has(item.slug)).map(x=>({url:`${base}/cam-nang/${encodeURIComponent(x.slug)}`,changeFrequency:'monthly' as const,priority:.78}));
 const legacyCruises=cruises.filter(item=>!productionCruiseSlugs.has(item.slug)).map(x=>detail('du-thuyen',x.slug));
 return [...staticPages,...destinations,...products,...stays.map(x=>detail('luu-tru',x.slug)),...tours.map(x=>detail('tour-du-lich',x.slug)),...cmsTours,...legacyCruises,...categories,...guides,...cmsGuides];
}