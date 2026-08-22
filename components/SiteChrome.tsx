'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return <>{children}</>;
  return <><Header /><main>{children}</main><Footer /><div className="floating-actions"><a className="call-float" href="tel:0969973949" aria-label="Gọi hotline">☎</a><a className="zalo-float" href="https://zalo.me/0969973949" aria-label="Chat Zalo">Z</a></div></>;
}
