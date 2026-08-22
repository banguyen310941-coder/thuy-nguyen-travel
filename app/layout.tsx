import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: { default: 'Thúy Nguyên Travel', template: '%s | Thúy Nguyên Travel' },
  description: 'Đặt villa, khách sạn, resort, tour và du thuyền toàn quốc. Hotline 0969 973 949.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <div className="floating-actions">
          <a className="call-float" href="tel:0969973949" aria-label="Gọi hotline">☎</a>
          <a className="zalo-float" href="https://zalo.me/0969973949" aria-label="Chat Zalo">Z</a>
        </div>
      </body>
    </html>
  );
}
