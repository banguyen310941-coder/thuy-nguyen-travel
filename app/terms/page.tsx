import type {Metadata} from 'next';
import {HappyGoInfoPage} from '@/components/HappyGoInfoPage';

const canonical='https://happygo.vn/dieu-khoan';
export const metadata:Metadata={
 title:'Điều khoản sử dụng dịch vụ HappyGo Travel',
 description:'Điều khoản sử dụng website và dịch vụ HappyGo Travel, bao gồm đặt dịch vụ, thanh toán, thay đổi, hủy và trách nhiệm sử dụng.',
 alternates:{canonical},
 openGraph:{title:'Điều khoản sử dụng | HappyGo Travel',description:'Điều khoản áp dụng khi truy cập website và sử dụng dịch vụ HappyGo Travel.',url:canonical,type:'website',locale:'vi_VN'}
};
export default function Page(){return <HappyGoInfoPage kind="terms"/>}
