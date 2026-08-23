import type { Metadata, Viewport } from 'next';
import './globals.css';
import './home.css';
import './mockup.css';
import './mobile-v2.css';
import './subpages.css';
import './booking-live.css';
import './tour-rich.css';
import './product-detail-v2.css';
import './units-public.css';
import './fixes.css';
import './rate-public.css';
import './cms-public.css';
import './cms-fixes.css';
import './cms-home-fixes.css';
import './guide-portal.css';
import './checkout.css';
import './customer-portal.css';
import './payment.css';
import { SiteChrome } from '@/components/SiteChrome';

export const viewport: Viewport = { width:'device-width', initialScale:1, maximumScale:5, viewportFit:'cover' };
export const metadata: Metadata = {
  metadataBase: new URL('https://banguyen310941-coder.github.io/thuy-nguyen-travel'),
  title: { default:'Thúy Nguyên Travel', template:'%s | Thúy Nguyên Travel' },
  description:'Đặt villa, khách sạn, resort, tour và du thuyền toàn quốc cùng Thúy Nguyên Travel. Tư vấn nhanh, thông tin minh bạch và xác nhận theo nhu cầu thực tế.',
  openGraph:{title:'Thúy Nguyên Travel',description:'Tour, villa, khách sạn, resort và du thuyền toàn quốc.',type:'website'},
  other:{'x-ui-version':'stabilization-v11-booking-pro-20260823'}
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="vi"><body data-ui-version="stabilization-v11-booking-pro-20260823"><SiteChrome>{children}</SiteChrome></body></html>}
