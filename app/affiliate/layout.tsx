import type {Metadata} from 'next';
import {AffiliatePublicActions} from '@/components/AffiliatePublicActions';
import './affiliate.css';
import './self-service.css';
import './register.css';
import './toolkit.css';

export const metadata:Metadata={title:'Cộng tác viên | HappyGo Travel',robots:{index:false,follow:false,nocache:true}};
export default function AffiliateLayout({children}:{children:React.ReactNode}){return <><AffiliatePublicActions/>{children}</>}
