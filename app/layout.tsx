import type { Metadata } from 'next';
import './globals.css';
import './home.css';
import './mockup.css';
import { SiteChrome } from '@/components/SiteChrome';

export const metadata: Metadata = {
  metadataBase: new URL('https://banguyen310941-coder.github.io/thuy-nguyen-travel'),
  title: { default: 'Thúy Nguyên Travel', template: '%s | Thúy Nguyên Travel' },
  description: 'Đặt villa, khách sạn, resort, tour và du thuyền toàn quốc. Hotline 0969 973 949.',
  openGraph: { title:'Thúy Nguyên Travel', description:'Tour, villa, khách sạn và du thuyền toàn quốc.', type:'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body><SiteChrome>{children}</SiteChrome></body></html>;
}
