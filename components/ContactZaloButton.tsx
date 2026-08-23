'use client';
import {useSiteSettings} from '@/components/useSiteSettings';
export function ContactZaloButton({className='',label='Zalo tư vấn'}:{className?:string;label?:string}){const s=useSiteSettings();const zalo=s.zalo.replace(/\D/g,'')||s.hotline.replace(/\D/g,'');return <a className={className} href={`https://zalo.me/${zalo}`} target="_blank" rel="noreferrer">{label}</a>}
