'use client';

import {useSiteSettings} from '@/components/useSiteSettings';

export function ContactQuickLink({kind='phone',label='Tư vấn',className=''}:{kind?:'phone'|'zalo';label?:string;className?:string}){
 const settings=useSiteSettings();
 const phone=settings.hotline.replace(/\D/g,'');
 const zalo=settings.zalo.replace(/\D/g,'')||phone;
 const href=kind==='zalo'?`https://zalo.me/${zalo}`:`tel:${phone}`;
 return <a className={className} href={href} target={kind==='zalo'?'_blank':undefined} rel={kind==='zalo'?'noreferrer':undefined}>{label}</a>;
}
