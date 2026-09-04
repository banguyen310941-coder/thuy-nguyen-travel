'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {useSiteSettings} from '@/components/useSiteSettings';
import {BookingCartBadge} from '@/components/BookingCart';
import {DemoTourSchedules} from '@/components/DemoTourSchedules';
import {ApprovedPartnerCatalogSync} from '@/components/ApprovedPartnerCatalogSync';
import {SiteProductionStateSync} from '@/components/SiteProductionStateSync';
import {AffiliateAttributionCapture} from '@/components/AffiliateAttributionCapture';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const settings=useSiteSettings();
  if (pathname.startsWith('/admin')) return <><DemoTourSchedules/>{children}</>;
  if (pathname.startsWith('/partner')) return <><DemoTourSchedules/>{children}</>;
  if (pathname.startsWith('/affiliate')) return <>{children}</>;
  const zalo=settings.zalo.replace(/\D/g,'');
  return <><AffiliateAttributionCapture/><SiteProductionStateSync/><ApprovedPartnerCatalogSync/><DemoTourSchedules/><Header /><main>{children}</main><Footer /><BookingCartBadge/><div className="floating-actions" aria-label="Liên hệ nhanh"><a className="zalo-float" href={`https://zalo.me/${zalo}`} target="_blank" rel="noreferrer" aria-label="Chat Zalo" title="Chat Zalo"><span className="zalo-word">Zalo</span><span className="contact-label"><small>Tư vấn nhanh</small><b>Chat Zalo</b></span></a></div></>;
}
