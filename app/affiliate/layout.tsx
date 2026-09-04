import type {Metadata} from 'next';
import './affiliate.css';
import './self-service.css';

export const metadata:Metadata={title:'Cộng tác viên | HappyGo Travel',robots:{index:false,follow:false,nocache:true}};
export default function AffiliateLayout({children}:{children:React.ReactNode}){return children}
