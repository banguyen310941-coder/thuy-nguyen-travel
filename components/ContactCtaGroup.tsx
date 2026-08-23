'use client';

import {formatPhone,useSiteSettings} from '@/components/useSiteSettings';

export function ContactCtaGroup({mode='hero',callLabel='Tư vấn ngay',zaloLabel='Zalo'}:{mode?:'hero'|'footer';callLabel?:string;zaloLabel?:string}){
 const settings=useSiteSettings();
 const phone=settings.hotline.replace(/\D/g,'');
 const zalo=settings.zalo.replace(/\D/g,'')||phone;
 if(mode==='footer') return <div className="sub-cta-actions"><a className="call" href={`tel:${phone}`}>☎ {callLabel==='Tư vấn ngay'?formatPhone(settings.hotline):callLabel}</a><a className="zalo" href={`https://zalo.me/${zalo}`} target="_blank" rel="noreferrer">{zaloLabel}</a></div>;
 return <div className="sub-hero-cta"><a className="solid" href={`tel:${phone}`}>☎ {callLabel}</a><a className="outline" href={`https://zalo.me/${zalo}`} target="_blank" rel="noreferrer">{zaloLabel}</a></div>;
}
