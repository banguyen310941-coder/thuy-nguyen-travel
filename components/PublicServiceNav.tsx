import Link from 'next/link';

type PublicSection='tour'|'villa'|'hotel'|'cruise'|'destination'|'guide'|'stay';

const items=[
 {id:'tour',label:'Tour du lịch',href:'/tour-du-lich'},
 {id:'villa',label:'Villa & Resort',href:'/villa-resort'},
 {id:'hotel',label:'Khách sạn',href:'/khach-san'},
 {id:'cruise',label:'Du thuyền',href:'/du-thuyen'},
 {id:'destination',label:'Điểm đến',href:'/diem-den'},
 {id:'guide',label:'Cẩm nang',href:'/cam-nang'},
] as const;

export function PublicServiceNav({active}:{active?:PublicSection}){
 return <nav className="sub-nav" aria-label="Dịch vụ HappyGo Travel"><div className="container sub-nav-inner">{items.map(item=><Link key={item.id} className={active===item.id?'active':undefined} aria-current={active===item.id?'page':undefined} href={item.href}>{item.label}</Link>)}</div></nav>;
}
