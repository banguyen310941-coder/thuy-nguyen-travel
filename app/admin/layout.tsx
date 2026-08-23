import type {Metadata} from 'next';
import {AdminStorageGuard} from '@/components/AdminStorageGuard';
import './admin.css';
import './bookings.css';
import './cms.css';
import './editor.css';
import './editor-pro-v2.css';
import './product-v2.css';
import './product-manager.css';
import './units.css';
import './utility.css';
import './admin-mobile-fixes.css';
import './media-picker.css';
import './rate-calendar.css';

export const metadata:Metadata={title:'Quản trị Thúy Nguyên Travel',robots:{index:false,follow:false,nocache:true}};
export default function AdminLayout({children}:{children:React.ReactNode}){return <><AdminStorageGuard/>{children}</>}
