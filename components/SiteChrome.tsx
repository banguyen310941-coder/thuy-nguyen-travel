'use client';

import {usePathname} from 'next/navigation';
import {Header} from '@/components/Header';
import {Footer} from '@/components/Footer';
import {formatPhone,phoneHref,useSiteSettings,type SiteSettings} from '@/components/useSiteSettings';
import {BookingCartBadge} from '@/components/BookingCart';
import {DemoTourSchedules} from '@/components/DemoTourSchedules';
import {ApprovedPartnerCatalogSync} from '@/components/ApprovedPartnerCatalogSync';
import {SiteProductionStateSync} from '@/components/SiteProductionStateSync';
import {AffiliateAttributionCapture} from '@/components/AffiliateAttributionCapture';

export function SiteChrome({children,initialSettings}:{children:React.ReactNode;initialSettings?:Partial<SiteSettings>|null}){
  const pathname=usePathname();
  const settings=useSiteSettings(initialSettings);
  if(pathname.startsWith('/admin'))return <><DemoTourSchedules/>{children}</>;
  if(pathname.startsWith('/partner'))return <><DemoTourSchedules/>{children}</>;
  if(pathname.startsWith('/affiliate'))return <>{children}</>;
  const phone=settings.hotline.replace(/\D/g,'');
  const callHref=phoneHref(settings.hotline);
  const zalo=settings.zalo.replace(/\D/g,'')||phone;
  return <><AffiliateAttributionCapture/><SiteProductionStateSync/><ApprovedPartnerCatalogSync/><DemoTourSchedules/><Header settings={settings}/><main>{children}</main><Footer settings={settings}/><BookingCartBadge/>{callHref&&<div className="floating-actions" aria-label="Liên hệ nhanh"><a className="call-float" href={`tel:${callHref}`} aria-label={`Gọi ${formatPhone(settings.hotline)}`} title={`Gọi ${formatPhone(settings.hotline)}`}><span>☎</span><span className="contact-label"><small>Hotline tư vấn</small><b>{formatPhone(settings.hotline)}</b></span></a><a className="zalo-float" href={`https://zalo.me/${zalo}`} target="_blank" rel="noreferrer" aria-label="Chat Zalo" title="Chat Zalo"><span className="zalo-word">Zalo</span><span className="contact-label"><small>Tư vấn nhanh</small><b>Chat Zalo</b></span></a></div>}</>;
}
