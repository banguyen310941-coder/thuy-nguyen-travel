import type {Metadata} from 'next';
import {HappyGoInfoPage} from '@/components/HappyGoInfoPage';

const canonical='https://happygo.vn/gioi-thieu';
export const metadata:Metadata={
 title:'Giới thiệu HappyGo Travel - Nền tảng du lịch toàn quốc',
 description:'Tìm hiểu HappyGo Travel, hệ sinh thái tour, villa, resort, khách sạn và du thuyền toàn quốc với định hướng tư vấn minh bạch và hỗ trợ xuyên suốt hành trình.',
 alternates:{canonical},
 openGraph:{title:'Giới thiệu HappyGo Travel',description:'HappyGo Travel kết nối khách hàng với tour, lưu trú và du thuyền trên toàn quốc.',url:canonical,type:'website',locale:'vi_VN'},
 twitter:{card:'summary_large_image',title:'Giới thiệu HappyGo Travel',description:'Nền tảng du lịch với tour, villa, resort, khách sạn và du thuyền toàn quốc.'}
};
export default function Page(){return <HappyGoInfoPage kind="about"/>}
