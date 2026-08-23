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
import { SiteChrome } from '@/components/SiteChrome';

export const viewport: Viewport = { width:'device-width', initialScale:1, maximumScale:5, viewportFit:'cover' };
export const metadata: Metadata = {
  metadataBase: new URL('https://banguyen310941-coder.github.io/thuy-nguyen-travel'),
  title: { default:'Thúy Nguyên Travel', template:'%s | Thúy Nguyên Travel' },
  description:'Đặt villa, khách sạn, resort, tour và du thuyền toàn quốc. Hotline 0969 973 949.',
  openGraph:{title:'Thúy Nguyên Travel',description:'Tour, villa, khách sạn và du thuyền toàn quốc.',type:'website'},
  other:{'x-ui-version':'stabilization-v7-guide-20260823'}
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="vi"><body data-ui-version="stabilization-v7-guide-20260823"><SiteChrome>{children}</SiteChrome></body></html>}
