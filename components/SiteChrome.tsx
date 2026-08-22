'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {useSiteSettings} from '@/components/useSiteSettings';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const settings=useSiteSettings();
  if (pathname.startsWith('/admin')) return <>{children}</>;
  return <><Header /><main>{children}</main><Footer /><div className="floating-actions"><a className="call-float" href={`tel:${settings.hotline}`} aria-label="Gọi hotline">☎</a><a className="zalo-float" href={`https://zalo.me/${settings.zalo}`} aria-label="Chat Zalo">Z</a></div></>;
}
