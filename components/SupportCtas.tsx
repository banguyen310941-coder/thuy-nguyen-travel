'use client';

import {formatPhone,useSiteSettings} from '@/components/useSiteSettings';

export function SupportCtas({compact=false}:{compact?:boolean}){
 const settings=useSiteSettings();
 const phone=settings.hotline.replace(/\D/g,'');
 const zalo=settings.zalo.replace(/\D/g,'')||phone;
 return <div className={compact?'support-ctas compact':'support-ctas'}><a className="solid" href={`tel:${phone}`}>☎ {compact?'Gọi ngay':`Gọi ${formatPhone(settings.hotline)}`}</a><a className="outline" href={`https://zalo.me/${zalo}`} target="_blank" rel="noreferrer">Zalo</a></div>
}
