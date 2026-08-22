import type { Metadata } from 'next';
import './globals.css';
import { SiteChrome } from '@/components/SiteChrome';

export const metadata: Metadata = {
  title: { default: 'Thúy Nguyên Travel', template: '%s | Thúy Nguyên Travel' },
  description: 'Đặt villa, khách sạn, resort, tour và du thuyền toàn quốc. Hotline 0969 973 949.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body><SiteChrome>{children}</SiteChrome></body></html>;
}
