import type {Metadata} from 'next';
import {StayLandingPage} from '@/components/StayLandingPage';
import {getSiteUrl} from '@/lib/site-url';

const path='/luu-tru';
export function generateMetadata():Metadata{
 const canonical=`${getSiteUrl()}${path}`;
 return{title:'Villa, Resort & Khách sạn toàn quốc',description:'Tìm và đặt villa, resort, khách sạn toàn quốc cùng HappyGo Travel. Lọc theo điểm đến, ngày ở, số khách và loại hình lưu trú.',alternates:{canonical},openGraph:{title:'Villa, Resort & Khách sạn | HappyGo Travel',description:'Khám phá villa, resort và khách sạn toàn quốc với lựa chọn minh bạch và tư vấn nhanh.',url:canonical,type:'website'},twitter:{card:'summary_large_image',title:'Villa, Resort & Khách sạn | HappyGo Travel',description:'Tìm nơi lưu trú phù hợp cho chuyến đi cùng HappyGo Travel.'}};
}

export default function StayPage(){return <StayLandingPage kind="all"/>}
