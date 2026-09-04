'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {formatPhone,useSiteSettings} from '@/components/useSiteSettings';
import {BookingCartBadge} from '@/components/BookingCart';
import {DemoTourSchedules} from '@/components/DemoTourSchedules';
import {ApprovedPartnerCatalogSync} from '@/components/ApprovedPartnerCatalogSync';
import {SiteProductionStateSync} from '@/components/SiteProductionStateSync';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const settings=useSiteSettings();
  if (pathname.startsWith('/admin')) return <><DemoTourSchedules/>{children}</>;
  if (pathname.startsWith('/partner')) return <><DemoTourSchedules/>{children}</>;
  const phoneDigits=settings.hotline.replace(/\D/g,'');
  const zalo=settings.zalo.replace(/\D/g,'')||phoneDigits;
  const phoneLabel=formatPhone(settings.hotline);
  return <><SiteProductionStateSync/><ApprovedPartnerCatalogSync/><DemoTourSchedules/><Header /><main>{children}</main><Footer /><BookingCartBadge/><div className="floating-actions" aria-label="Liên hệ nhanh"><a className="call-float" href={`tel:${phoneDigits}`} aria-label={`Gọi hotline ${phoneLabel}`} title={`Gọi ${phoneLabel}`}><span className="contact-icon">☎</span><span className="contact-label"><small>Hotline tư vấn</small><b>{phoneLabel}</b></span></a><a className="zalo-float" href={`https://zalo.me/${zalo}`} target="_blank" rel="noreferrer" aria-label="Chat Zalo" title="Chat Zalo"><span className="zalo-word">Zalo</span><span className="contact-label"><small>Tư vấn nhanh</small><b>Chat Zalo</b></span></a></div></>;
}
