'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef} from 'react';
import type {SiteSettings} from '@/components/useSiteSettings';
import {phoneHref} from '@/components/useSiteSettings';
import {HappyGoLogo} from '@/components/HappyGoLogo';
import {CustomerAccountBadge} from '@/components/CustomerAccount';
import {productProvinces} from '@/data/product-provinces';
import styles from '@/components/Header.module.css';

type NavChild={label:string;href:string;meta?:string};
type NavItem={label:string;href:string;children?:NavChild[]};

const productChildren:NavChild[]=productProvinces.map(item=>({label:item.name,meta:item.menuMeta,href:`/san-pham/tinh-thanh/${item.slug}`}));
const nav:NavItem[]=[
 {label:'Trang chủ',href:'/'},
 {label:'Sản phẩm',href:'/san-pham/tinh-thanh',children:productChildren},
 {label:'Khách sạn',href:'/khach-san',children:[
  {label:'Sầm Sơn',meta:'Thanh Hóa',href:'/diem-den/sam-son/khach-san'},
  {label:'Hạ Long',meta:'Quảng Ninh',href:'/diem-den/ha-long/khach-san'},
  {label:'Quy Nhơn',meta:'Gia Lai',href:'/khach-san?q=Quy%20Nh%C6%A1n'},
  {label:'Vĩnh Phúc',href:'/khach-san?q=V%C4%A9nh%20Ph%C3%BAc'},
 ]},
 {label:'Villa & Resort',href:'/villa-resort',children:[
  {label:'Hạ Long',meta:'Quảng Ninh',href:'/diem-den/ha-long/villa-resort'},
  {label:'Sầm Sơn',meta:'Thanh Hóa',href:'/diem-den/sam-son/villa-resort'},
  {label:'Hội An',meta:'Đà Nẵng',href:'/villa-resort?q=H%E1%BB%99i%20An'},
 ]},
 {label:'Du thuyền',href:'/du-thuyen',children:[
  {label:'Vịnh Hạ Long',meta:'Quảng Ninh',href:'/diem-den/ha-long/du-thuyen'},
  {label:'Vịnh Lan Hạ',meta:'Hải Phòng',href:'/du-thuyen?q=V%E1%BB%8Bnh%20Lan%20H%E1%BA%A1'},
 ]},
 {label:'Tour du lịch',href:'/tour-du-lich'},
 {label:'Điểm đến',href:'/diem-den'},
 {label:'Cẩm nang',href:'/cam-nang'},
];
const internalAliases:Record<string,string[]>={
 '/tour-du-lich':['/tours'],
 '/du-thuyen':['/cruises'],
 '/diem-den':['/destinations'],
 '/cam-nang':['/guide'],
};
function pathMatches(pathname:string,prefix:string){return pathname===prefix||pathname.startsWith(`${prefix}/`)}
function active(pathname:string,href:string){if(href==='/')return pathname==='/';if(pathMatches(pathname,href))return true;return (internalAliases[href]||[]).some(alias=>pathMatches(pathname,alias))}

export function Header({settings}:{settings:SiteSettings}){
 const pathname=usePathname();
 const menuRef=useRef<HTMLDetailsElement>(null);
 const closeMobileMenu=()=>{if(menuRef.current)menuRef.current.open=false};
 useEffect(()=>{closeMobileMenu()},[pathname]);
 useEffect(()=>{const p=(e:PointerEvent)=>{const m=menuRef.current;if(m?.open&&!m.contains(e.target as Node))m.open=false};const k=(e:KeyboardEvent)=>{if(e.key==='Escape')closeMobileMenu()};document.addEventListener('pointerdown',p);document.addEventListener('keydown',k);return()=>{document.removeEventListener('pointerdown',p);document.removeEventListener('keydown',k)}},[]);
 const phone=settings.hotline.replace(/\D/g,'');
 const phoneLink=phoneHref(settings.hotline);
 return <header className="site-header mock-header happygo-header-v2">
  <div className="mock-contactbar"><div className="container mock-contactbar-inner"><div className="mock-mini-contact"><span>✉ {settings.email}</span>{phone&&phoneLink&&<a href={`tel:${phoneLink}`}>☎ {settings.hotline}</a>}</div><div className="mock-top-actions"><Link href="/cam-nang">Kinh nghiệm du lịch</Link><a href={`https://zalo.me/${settings.zalo.replace(/\D/g,'')}`} target="_blank" rel="noreferrer">Zalo</a><Link href="/partner">Đối tác</Link></div></div></div>
  <div className="mock-mobile-head container">
   <details className="mobile-menu" ref={menuRef}>
    <summary className="mock-mobile-icon" aria-label="Mở menu">☰</summary>
    <nav className={`mobile-menu-panel ${styles.mobilePanel}`}>
     {nav.map(item=>item.children?.length?<details key={item.label} className={styles.mobileGroup}><summary aria-current={active(pathname,item.href)?'page':undefined}>{item.label}<span>⌄</span></summary><div><Link href={item.href} onClick={closeMobileMenu}>Xem tất cả {item.label}</Link>{item.children.map(child=><Link key={child.href} href={child.href} onClick={closeMobileMenu}><b>{child.label}</b>{child.meta&&<small>{child.meta}</small>}</Link>)}</div></details>:<Link key={item.label} href={item.href} aria-current={active(pathname,item.href)?'page':undefined} onClick={closeMobileMenu}>{item.label}</Link>)}
     <Link href="/tai-khoan" onClick={closeMobileMenu}>👤 Tài khoản khách hàng</Link>
    </nav>
   </details>
   <Link className="mock-mobile-logo happygo-link" href="/"><HappyGoLogo compact/></Link>
   <Link className="mock-mobile-icon" href="/tai-khoan" aria-label="Tài khoản khách hàng">👤</Link>
  </div>
  <div className="container mock-brand-row"><Link className="mock-logo happygo-link" href="/"><HappyGoLogo/></Link><div className="mock-brand-tools"><Link href="/tim-kiem" className="mock-search-mini">⌕ Tìm điểm đến, khách sạn, tour...</Link><CustomerAccountBadge/></div></div>
  <div className="mock-nav-wrap"><nav className={`container mock-nav ${styles.desktopNav}`}>{nav.map(item=>item.children?.length?<div key={item.label} className={styles.navGroup}><Link href={item.href} aria-current={active(pathname,item.href)?'page':undefined}>{item.label}<span className={styles.chevron}>⌄</span></Link><div className={styles.dropdown}><div className={styles.dropdownHead}><b>{item.label==='Sản phẩm'?'Sản phẩm theo tỉnh/thành':`${item.label} theo điểm đến`}</b><Link href={item.href}>Xem tất cả →</Link></div>{item.children.map(child=><Link key={child.href} href={child.href} className={styles.destinationLink}><span><b>{child.label}</b>{child.meta&&<small>{child.meta}</small>}</span><em>›</em></Link>)}</div></div>:<Link key={item.label} href={item.href} aria-current={active(pathname,item.href)?'page':undefined}>{item.label}</Link>)}</nav></div>
 </header>
}
