import type {Metadata} from 'next';
import {StayLandingPage} from '@/components/StayLandingPage';
import {getSiteUrl} from '@/lib/site-url';
import {destinationSlug,getSeoDestination} from '@/data/seo-destinations';

const path='/khach-san';
type PageProps={searchParams:Promise<Record<string,string|string[]|undefined>>};
export async function generateMetadata({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}):Promise<Metadata>{
 const query=await searchParams,raw=Array.isArray(query.q)?String(query.q[0]||''):String(query.q||''),destination=getSeoDestination(raw)?.name||raw,slug=destinationSlug(destination),canonical=slug?`${getSiteUrl()}/diem-den/${slug}/khach-san`:`${getSiteUrl()}/khach-san`,title=destination?`Khách sạn tại ${destination}`:'Khách sạn toàn quốc',description=destination?`Tìm và đặt khách sạn tại ${destination} cùng HappyGo Travel. Lọc theo ngày ở, số khách và nhu cầu chuyến đi.`:'Tìm và đặt khách sạn toàn quốc cùng HappyGo Travel. Lọc theo điểm đến, ngày ở, số khách, hạng phòng và nhu cầu chuyến đi.';
 return{title,description,alternates:{canonical},openGraph:{title:`${title} | HappyGo Travel`,description,url:canonical,type:'website'},twitter:{card:'summary_large_image',title:`${title} | HappyGo Travel`,description}};
}

export default async function HotelPage({searchParams}:PageProps){return <StayLandingPage kind="hotel" query={await searchParams}/>}
