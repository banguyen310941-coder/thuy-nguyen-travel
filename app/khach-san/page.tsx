import type {Metadata} from 'next';
import {StayLandingPage} from '@/components/StayLandingPage';
import {getSiteUrl} from '@/lib/site-url';

const path='/khach-san';
export function generateMetadata():Metadata{
 const canonical=`${getSiteUrl()}${path}`;
 return{title:'Khách sạn toàn quốc',description:'Tìm và đặt khách sạn toàn quốc cùng HappyGo Travel. Lọc theo điểm đến, ngày ở, số khách, hạng phòng và nhu cầu chuyến đi.',alternates:{canonical},openGraph:{title:'Khách sạn | HappyGo Travel',description:'Khám phá khách sạn toàn quốc với thông tin rõ ràng, chính sách minh bạch và tư vấn nhanh.',url:canonical,type:'website'},twitter:{card:'summary_large_image',title:'Khách sạn | HappyGo Travel',description:'Tìm khách sạn phù hợp cho chuyến công tác, nghỉ dưỡng và du lịch gia đình.'}};
}

export default function HotelPage(){return <StayLandingPage kind="hotel"/>}
