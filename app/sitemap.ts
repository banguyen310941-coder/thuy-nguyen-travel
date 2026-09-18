import type {MetadataRoute} from 'next';
import {stays,tours,cruises} from '@/data/catalog';
import {guidePosts} from '@/data/guides';
import {guideCategories} from '@/data/guideCategories';
import {seoDestinations} from '@/data/seo-destinations';
import {productProvinces} from '@/data/product-provinces';
import {listPublishedProductSeo} from '@/lib/public-product-seo';
import {listPublishedTourSeo} from '@/lib/public-tour-seo';
import {listPublishedGuideSeo} from '@/lib/public-guide-seo';
import {getSiteUrl} from '@/lib/site-url';
import {publicProductPath} from '@/lib/public-product-url';

export const dynamic='force-dynamic';

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const base=getSiteUrl();
 const staticPages=[['',1,'daily'],['/luu-tru',.9,'daily'],['/villa',.92,'daily'],['/khach-san-resort',.92,'daily'],['/tour-du-lich',.9,'daily'],['/du-thuyen',.9,'daily'],['/diem-den',.9,'weekly'],['/cam-nang',.85,'weekly'],['/san-pham',.72,'weekly'],['/san-pham/tinh-thanh',.88,'daily'],['/gioi-thieu',.5,'monthly'],['/lien-he',.6,'monthly'],['/dieu-khoan',.35,'yearly'],['/chinh-sach-bao-mat',.35,'yearly'],['/huong-dan-thanh-toan',.45,'yearly']].map(([path,priority,changeFrequency])=>({url:`${base}${path}`,changeFrequency:changeFrequency as 'daily'|'weekly'|'monthly'|'yearly',priority:Number(priority)}));
 const detail=(path:string,slug:string)=>({url:`${base}/${path}/${encodeURIComponent(slug)}`,changeFrequency:'weekly' as const,priority:.8});
 const [production,productionTours,productionGuides]=await Promise.all([listPublishedProductSeo(),listPublishedTourSeo(),listPublishedGuideSeo()]);
 const products=production.filter(item=>!item.type.includes('Tour')).map(item=>({url:`${base}${publicProductPath(item.type,item.slug)}`,...(item.updatedAt&&Number.isFinite(+new Date(item.updatedAt))?{lastModified:new Date(item.updatedAt)}:{}),changeFrequency:'daily' as const,priority:.9}));
 const productionStaySlugs=new Set(production.filter(item=>item.type==='Khách sạn'||item.type==='Villa & Resort').map(item=>item.slug));
 const productionCruiseSlugs=new Set(production.filter(item=>item.type==='Du thuyền').map(item=>item.slug));
 const staticTourSlugs=new Set(tours.map(item=>item.slug));
 const cmsTours=productionTours.filter(item=>!staticTourSlugs.has(item.slug)).map(item=>({url:`${base}/tour-du-lich/${encodeURIComponent(item.slug)}`,...(item.updatedAt&&Number.isFinite(+new Date(item.updatedAt))?{lastModified:new Date(item.updatedAt)}:{}),changeFrequency:'weekly' as const,priority:.82}));
 const cmsGuideSlugs=new Set(productionGuides.map(item=>item.slug));
 const cmsGuides=productionGuides.map(item=>({url:`${base}/cam-nang/${encodeURIComponent(item.slug)}`,...(item.updatedAt&&Number.isFinite(+new Date(item.updatedAt))?{lastModified:new Date(item.updatedAt)}:{}),changeFrequency:'weekly' as const,priority:.78}));
 const categories=guideCategories.map(category=>({url:`${base}/cam-nang/danh-muc/${category.slug}`,changeFrequency:'weekly' as const,priority:.7}));
 const destinationSlugs=[...seoDestinations.map(item=>item.slug),'long-hai','vung-tau'];
 const destinations=destinationSlugs.map(slug=>({url:`${base}/diem-den/${slug}`,changeFrequency:'weekly' as const,priority:.85}));
 const destinationServices=seoDestinations.flatMap(item=>item.services.filter(service=>service.href.startsWith(`/diem-den/${item.slug}/`)).map(service=>({url:`${base}${service.href}`,changeFrequency:'daily' as const,priority:.82})));
 const provincePages=productProvinces.map(item=>({url:`${base}/san-pham/tinh-thanh/${item.slug}`,changeFrequency:'daily' as const,priority:.86}));
 const guides=guidePosts.filter(item=>!cmsGuideSlugs.has(item.slug)).map(x=>({url:`${base}/cam-nang/${encodeURIComponent(x.slug)}`,changeFrequency:'monthly' as const,priority:.78}));
 const legacyCruises=cruises.filter(item=>!productionCruiseSlugs.has(item.slug)).map(x=>detail('du-thuyen',x.slug));
 return [...staticPages,...provincePages,...destinations,...destinationServices,...products,...stays.filter(x=>!productionStaySlugs.has(x.slug)).map(x=>detail('luu-tru',x.slug)),...tours.map(x=>detail('tour-du-lich',x.slug)),...cmsTours,...legacyCruises,...categories,...guides,...cmsGuides];
}
