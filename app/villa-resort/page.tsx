import type {Metadata} from 'next';
import {StayLandingPage} from '@/components/StayLandingPage';
import {getSiteUrl} from '@/lib/site-url';
import {destinationSlug,getSeoDestination} from '@/data/seo-destinations';

const path='/villa-resort';
type PageProps={searchParams:Promise<Record<string,string|string[]|undefined>>};
export async function generateMetadata({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}):Promise<Metadata>{
 const query=await searchParams,raw=Array.isArray(query.q)?String(query.q[0]||''):String(query.q||''),destination=getSeoDestination(raw)?.name||raw,slug=destinationSlug(destination),canonical=slug?`${getSiteUrl()}/diem-den/${slug}/villa-resort`:`${getSiteUrl()}/villa-resort`,title=destination?`Villa tại ${destination}`:'Villa toàn quốc',description=destination?`Tìm và đặt villa nguyên căn tại ${destination} cùng HappyGo Travel. Lọc theo ngày ở, số khách và nhu cầu chuyến đi.`:'Tìm và đặt villa nguyên căn toàn quốc cùng HappyGo Travel. Lọc theo điểm đến, ngày ở, số khách và tiện ích.';
 return{title,description,alternates:{canonical},openGraph:{title:`${title} | HappyGo Travel`,description,url:canonical,type:'website'},twitter:{card:'summary_large_image',title:`${title} | HappyGo Travel`,description}};
}

export default async function VillaResortPage({searchParams}:PageProps){return <StayLandingPage kind="villa" query={await searchParams}/>}
