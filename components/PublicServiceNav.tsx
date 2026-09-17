import Link from 'next/link';
import {destinationSlug} from '@/data/seo-destinations';

type PublicSection='tour'|'villa'|'hotel'|'cruise'|'destination'|'guide'|'stay';

const items=[
 {id:'tour',label:'Tour du lịch',href:'/tour-du-lich'},
 {id:'villa',label:'Villa',href:'/villa-resort'},
 {id:'hotel',label:'Khách sạn & Resort',href:'/khach-san'},
 {id:'cruise',label:'Du thuyền',href:'/du-thuyen'},
 {id:'destination',label:'Điểm đến',href:'/diem-den'},
 {id:'guide',label:'Cẩm nang',href:'/cam-nang'},
] as const;

function contextualHref(item:(typeof items)[number],destination?:string){
 const place=String(destination||'').trim();
 if(!place)return item.href;
 const slug=destinationSlug(place);
 if(slug&&item.id==='tour')return `/diem-den/${slug}/tour-du-lich`;
 if(slug&&item.id==='villa')return `/diem-den/${slug}/villa-resort`;
 if(slug&&item.id==='hotel')return `/diem-den/${slug}/khach-san`;
 if(slug&&item.id==='cruise')return `/diem-den/${slug}/du-thuyen`;
 if(['tour','villa','hotel','cruise'].includes(item.id))return `${item.href}?q=${encodeURIComponent(place)}`;
 if(item.id==='destination')return slug?`/diem-den/${slug}`:item.href
 return item.href;
}

export function PublicServiceNav({active,destination}:{active?:PublicSection;destination?:string}){
 return <nav className="sub-nav" aria-label="Dịch vụ HappyGo Travel"><div className="container sub-nav-inner">{items.map(item=><Link key={item.id} className={active===item.id?'active':undefined} aria-current={active===item.id?'page':undefined} href={contextualHref(item,destination)}>{item.label}</Link>)}</div></nav>;
}
