import type {Metadata} from 'next';
import {HappyGoInfoPage} from '@/components/HappyGoInfoPage';

const canonical='https://happygo.vn/chinh-sach-bao-mat';
export const metadata:Metadata={
 title:'Chính sách bảo mật thông tin | HappyGo Travel',
 description:'Chính sách bảo mật của HappyGo Travel về thu thập, sử dụng, chia sẻ và bảo vệ thông tin khách hàng khi tư vấn và đặt dịch vụ du lịch.',
 alternates:{canonical},
 openGraph:{title:'Chính sách bảo mật | HappyGo Travel',description:'Cách HappyGo Travel thu thập, sử dụng và bảo vệ thông tin khách hàng.',url:canonical,type:'website',locale:'vi_VN'}
};
export default function Page(){return <HappyGoInfoPage kind="privacy"/>}
