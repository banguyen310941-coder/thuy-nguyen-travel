import type {Metadata} from 'next';
import {getSiteUrl} from '@/lib/site-url';

export const metadata:Metadata={
 title:{absolute:'Tài khoản khách hàng | HappyGo Travel'},
 description:'Đăng nhập hoặc tạo tài khoản HappyGo để theo dõi booking và thanh toán.',
 robots:{index:false,follow:true},
 alternates:{canonical:`${getSiteUrl()}/tai-khoan`}
};

export default function AccountLayout({children}:{children:React.ReactNode}){return children}
