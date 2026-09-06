import type {Metadata} from 'next';
import {HappyGoInfoPage} from '@/components/HappyGoInfoPage';
import {getSiteUrl} from '@/lib/site-url';

export function generateMetadata():Metadata{
 const canonical=`${getSiteUrl()}/huong-dan-thanh-toan`;
 return{
  title:'Hướng dẫn thanh toán dịch vụ du lịch | HappyGo Travel',
  description:'Hướng dẫn thanh toán tour, villa, khách sạn và du thuyền tại HappyGo Travel: xác nhận đơn, đặt cọc, nội dung chuyển khoản và lưu ý an toàn.',
  alternates:{canonical},
  openGraph:{title:'Hướng dẫn thanh toán | HappyGo Travel',description:'Quy trình thanh toán, xác nhận đơn và lưu ý an toàn khi đặt dịch vụ HappyGo Travel.',url:canonical,type:'website',locale:'vi_VN'}
 };
}
export default function Page(){return <HappyGoInfoPage kind="payment"/>}
