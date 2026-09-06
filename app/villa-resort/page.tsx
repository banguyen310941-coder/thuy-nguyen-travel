import type {Metadata} from 'next';
import {StayLandingPage} from '@/components/StayLandingPage';
import {getSiteUrl} from '@/lib/site-url';

const path='/villa-resort';
type PageProps={searchParams:Promise<Record<string,string|string[]|undefined>>};
export function generateMetadata():Metadata{
 const canonical=`${getSiteUrl()}${path}`;
 return{title:'Villa & Resort toàn quốc',description:'Tìm và đặt villa nguyên căn, resort nghỉ dưỡng toàn quốc cùng HappyGo Travel. Lọc theo điểm đến, ngày ở, số khách và tiện ích.',alternates:{canonical},openGraph:{title:'Villa & Resort | HappyGo Travel',description:'Khám phá villa nguyên căn và resort nghỉ dưỡng với thông tin rõ ràng, ảnh đúng sản phẩm và tư vấn nhanh.',url:canonical,type:'website'},twitter:{card:'summary_large_image',title:'Villa & Resort | HappyGo Travel',description:'Tìm Villa & Resort phù hợp cho gia đình, nhóm bạn và đoàn nghỉ dưỡng.'}};
}

export default async function VillaResortPage({searchParams}:PageProps){return <StayLandingPage kind="villa" query={await searchParams}/>}
