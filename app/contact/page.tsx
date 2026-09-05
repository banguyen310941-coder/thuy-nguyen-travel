import type {Metadata} from 'next';
import {HappyGoInfoPage} from '@/components/HappyGoInfoPage';

const canonical='https://happygo.vn/lien-he';
export const metadata:Metadata={
 title:'Liên hệ HappyGo Travel - Tư vấn tour, villa, khách sạn, du thuyền',
 description:'Liên hệ HappyGo Travel để được tư vấn tour, villa, resort, khách sạn và du thuyền. Hỗ trợ khách hàng toàn quốc qua hotline, email và Zalo.',
 alternates:{canonical},
 openGraph:{title:'Liên hệ HappyGo Travel',description:'Tư vấn và hỗ trợ đặt dịch vụ du lịch toàn quốc.',url:canonical,type:'website',locale:'vi_VN'},
 twitter:{card:'summary_large_image',title:'Liên hệ HappyGo Travel',description:'Tư vấn tour, lưu trú và du thuyền toàn quốc.'}
};
export default function Page(){return <HappyGoInfoPage kind="contact"/>}
