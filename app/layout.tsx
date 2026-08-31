import type { Metadata, Viewport } from 'next';
import './globals.css';
import './home.css';
import './mockup.css';
import './mobile-v2.css';
import './subpages.css';
import './booking-live.css';
import './checkout.css';
import './tour-rich.css';
import './product-detail-v2.css';
import './units-public.css';
import './fixes.css';
import './rate-public.css';
import './cms-public.css';
import './cms-fixes.css';
import './cms-home-fixes.css';
import './guide-portal.css';
import './happygo-brand.css';
import './happygo-footer.css';
import { SiteChrome } from '@/components/SiteChrome';

export const viewport: Viewport = { width:'device-width', initialScale:1, maximumScale:5, viewportFit:'cover', themeColor:'#0d47a1' };
export const metadata: Metadata = {
  metadataBase: new URL('https://happygo.vn'),
  title: { default:'HappyGo Travel', template:'%s | HappyGo Travel' },
  description:'HappyGo Travel - Tour, villa, khách sạn, resort và du thuyền toàn quốc. Hành trình hạnh phúc, kết nối yêu thương.',
  applicationName:'HappyGo Travel',
  keywords:['HappyGo Travel','du lịch','tour du lịch','villa resort','khách sạn','du thuyền','happygo.vn'],
  openGraph:{title:'HappyGo Travel',description:'Hành trình hạnh phúc, kết nối yêu thương. Tour, villa, khách sạn và du thuyền toàn quốc.',type:'website',siteName:'HappyGo Travel',url:'https://happygo.vn'},
  other:{'x-ui-version':'happygo-brand-v1-20260831'}
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="vi"><body id="top" data-ui-version="happygo-brand-v1-20260831"><SiteChrome>{children}</SiteChrome></body></html>}
