import './admin.css';
import './bookings.css';
import './cms.css';
import './editor.css';
import './editor-pro-v2.css';
import './product-v2.css';
import './product-manager.css';
import './units.css';
import {AdminDeleteEnhancer} from '@/components/AdminDeleteEnhancer';

export default function AdminLayout({children}:{children:React.ReactNode}){return <><AdminDeleteEnhancer/>{children}</>}
