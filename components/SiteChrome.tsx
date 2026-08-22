'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DEFAULT_SITE_SETTINGS, loadSiteSettings } from '@/lib/site-settings';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [settings,setSettings]=useState(DEFAULT_SITE_SETTINGS);
  useEffect(()=>{const sync=()=>setSettings(loadSiteSettings());sync();window.addEventListener('storage',sync);window.addEventListener('tn-site-settings',sync);return()=>{window.removeEventListener('storage',sync);window.removeEventListener('tn-site-settings',sync)}},[]);
  if (pathname.startsWith('/admin')) return <>{children}</>;
  const phone=settings.hotline.replace(/\D/g,'');
  const zalo=settings.zalo.replace(/\D/g,'')||phone;
  return <><Header /><main>{children}</main><Footer /><div className="floating-actions" aria-label="Liên hệ nhanh"><a className="call-float" href={`tel:${phone}`} aria-label={`Gọi hotline ${settings.hotline}`} title={`Gọi ${settings.hotline}`}><span className="contact-icon">☎</span><span className="contact-label"><small>Hotline tư vấn</small><b>{settings.hotline}</b></span></a><a className="zalo-float" href={`https://zalo.me/${zalo}`} target="_blank" rel="noreferrer" aria-label="Chat Zalo" title="Chat Zalo"><span className="zalo-word">Zalo</span><span className="contact-label"><small>Tư vấn nhanh</small><b>Chat Zalo</b></span></a></div></>;
}
