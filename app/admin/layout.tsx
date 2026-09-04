import type {Metadata} from 'next';
import {AdminStorageGuard} from '@/components/AdminStorageGuard';
import {AdminSeoGuideSeedSync} from '@/components/AdminSeoGuideSeedSync';
import {AdminSeoDemoSeeder} from '@/components/AdminSeoDemoSeeder';
import {AdminTourSeedSync} from '@/components/AdminTourSeedSync';
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
import './connectivity.css';
import './admin-refresh.css';
import './admin-detail-pro.css';
import './team-chat-v4.css';
import './admin-action-language.css';
import './crm-workboard-v2.css';
import './partner-manager-v2.css';

export const metadata:Metadata={title:'Quản trị HappyGo Travel',robots:{index:false,follow:false,nocache:true}};
export default function AdminLayout({children}:{children:React.ReactNode}){return <><AdminStorageGuard/><AdminSeoGuideSeedSync/><AdminSeoDemoSeeder/><AdminTourSeedSync/>{children}</>}
