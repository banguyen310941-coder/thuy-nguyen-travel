'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import type {SiteSettings} from '@/components/useSiteSettings';
import {phoneHref} from '@/components/useSiteSettings';
import {HappyGoLogo} from '@/components/HappyGoLogo';
import {CustomerAccountBadge} from '@/components/CustomerAccount';
import styles from '@/components/Header.module.css';

type NavDestination={label:string;href:string};
type ProvinceGroup={label:string;href:string;children?:NavDestination[]};
type NavItem={label:string;href:string;provinces?:ProvinceGroup[]};

const nav:NavItem[]=[
 {label:'Trang chủ',href:'/'},
 {label:'Khách sạn & Resort',href:'/khach-san-resort',provinces:[
  {label:'Quảng Ninh',href:'/khach-san-resort?q=Qu%E1%BA%A3ng%20Ninh',children:[
   {label:'Hạ Long',href:'/diem-den/ha-long/khach-san-resort'},
  ]},
  {label:'Thanh Hóa',href:'/khach-san-resort?q=Thanh%20H%C3%B3a',children:[
   {label:'Sầm Sơn',href:'/diem-den/sam-son/khach-san-resort'},
  ]},
  {label:'Gia Lai',href:'/khach-san-resort?q=Gia%20Lai',children:[
   {label:'Quy Nhơn',href:'/khach-san-resort?q=Quy%20Nh%C6%A1n'},
  ]},
  {label:'Phú Thọ',href:'/diem-den/phu-tho/khach-san-resort'},
 ]},
 {label:'Villa',href:'/villa',provinces:[
  {label:'Quảng Ninh',href:'/villa?q=Qu%E1%BA%A3ng%20Ninh',children:[
   {label:'Hạ Long',href:'/diem-den/ha-long/villa'},
   {label:'Vân Đồn',href:'/diem-den/van-don/villa'},
  ]},
  {label:'Thanh Hóa',href:'/villa?q=Thanh%20H%C3%B3a',children:[
   {label:'Sầm Sơn',href:'/diem-den/sam-son/villa'},
  ]},
  {label:'Đà Nẵng',href:'/villa?q=%C4%90%C3%A0%20N%E1%BA%B5ng',children:[
   {label:'Hội An',href:'/villa?q=H%E1%BB%99i%20An'},
  ]},
 ]},
 {label:'Du thuyền',href:'/du-thuyen',provinces:[
  {label:'Quảng Ninh',href:'/du-thuyen?q=Qu%E1%BA%A3ng%20Ninh',children:[
   {label:'Vịnh Hạ Long',href:'/diem-den/ha-long/du-thuyen'},
  ]},
  {label:'Hải Phòng',href:'/du-thuyen?q=H%E1%BA%A3i%20Ph%C3%B2ng',children:[
   {label:'Vịnh Lan Hạ',href:'/du-thuyen?q=V%E1%BB%8Bnh%20Lan%20H%E1%BA%A1'},
  ]},
 ]},
 {label:'Tour du lịch',href:'/tour-du-lich'},
 {label:'Điểm đến',href:'/diem-den'},
 {label:'Cẩm nang',href:'/cam-nang'},
];
const internalAliases:Record<string,string[]>={
 '/villa':['/villa-resort'],
 '/khach-san-resort':['/khach-san'],
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
 const [openProvinceKey,setOpenProvinceKey]=useState<string|null>(null);
 const closeMobileMenu=()=>{if(menuRef.current)menuRef.current.open=false};
 const toggleProvince=(key:string)=>setOpenProvinceKey(current=>current===key?null:key);
 useEffect(()=>{closeMobileMenu();setOpenProvinceKey(null)},[pathname]);
 useEffect(()=>{const p=(e:PointerEvent)=>{const m=menuRef.current;if(m?.open&&!m.contains(e.target as Node))m.open=false};const k=(e:KeyboardEvent)=>{if(e.key==='Escape')closeMobileMenu()};document.addEventListener('pointerdown',p);document.addEventListener('keydown',k);return()=>{document.removeEventListener('pointerdown',p);document.removeEventListener('keydown',k)}},[]);
 const phone=settings.hotline.replace(/\D/g,'');
 const phoneLink=phoneHref(settings.hotline);
 return <header className="site-header mock-header happygo-header-v2">
  <div className="mock-contactbar"><div className="container mock-contactbar-inner"><div className="mock-mini-contact"><span>✉ {settings.email}</span>{phone&&phoneLink&&<a href={`tel:${phoneLink}`}>☎ {settings.hotline}</a>}</div><div className="mock-top-actions"><Link href="/cam-nang">Kinh nghiệm du lịch</Link><a href={`https://zalo.me/${settings.zalo.replace(/\D/g,'')}`} target="_blank" rel="noreferrer">Zalo</a><Link href="/partner">Đối tác</Link></div></div></div>
  <div className="mock-mobile-head container">
   <details className="mobile-menu" ref={menuRef}>
    <summary className="mock-mobile-icon" aria-label="Mở menu">☰</summary>
    <nav className={`mobile-menu-panel ${styles.mobilePanel}`}>
     {nav.map(item=>item.provinces?.length?<details key={item.label} className={styles.mobileGroup}><summary aria-current={active(pathname,item.href)?'page':undefined}>{item.label}<span>⌄</span></summary><div><Link href={item.href} onClick={closeMobileMenu}>Xem tất cả {item.label}</Link>{item.provinces.map(province=>{const key=`mobile:${item.label}:${province.label}`;const hasChildren=Boolean(province.children?.length);const isOpen=openProvinceKey===key;return <div key={province.label} className={styles.mobileProvince}><div className={styles.mobileProvinceHeader}><Link href={province.href} className={styles.mobileProvinceLink} onClick={closeMobileMenu}><b>{province.label}</b></Link>{hasChildren?<button type="button" className={styles.mobileProvinceToggle} aria-label={`${isOpen?'Thu gọn':'Mở'} điểm du lịch ${province.label}`} aria-expanded={isOpen} onClick={()=>toggleProvince(key)}><span>⌄</span></button>:null}</div>{hasChildren&&isOpen?<div className={styles.mobileProvinceChildren}>{province.children!.map(child=><Link key={child.href} href={child.href} onClick={closeMobileMenu}>{child.label}</Link>)}</div>:null}</div>})}</div></details>:<Link key={item.label} href={item.href} aria-current={active(pathname,item.href)?'page':undefined} onClick={closeMobileMenu}>{item.label}</Link>)}
     <Link href="/tai-khoan" onClick={closeMobileMenu}>👤 Tài khoản khách hàng</Link>
    </nav>
   </details>
   <Link className="mock-mobile-logo happygo-link" href="/"><HappyGoLogo compact/></Link>
   <Link className="mock-mobile-icon" href="/tai-khoan" aria-label="Tài khoản khách hàng">👤</Link>
  </div>
  <div className="container mock-brand-row"><Link className="mock-logo happygo-link" href="/"><HappyGoLogo/></Link><div className="mock-brand-tools"><Link href="/tim-kiem" className="mock-search-mini">⌕ Tìm điểm đến, khách sạn, tour...</Link><CustomerAccountBadge/></div></div>
  <div className="mock-nav-wrap"><nav className={`container mock-nav ${styles.desktopNav}`}>{nav.map(item=>item.provinces?.length?<div key={item.label} className={styles.navGroup}><Link href={item.href} aria-current={active(pathname,item.href)?'page':undefined}>{item.label}<span className={styles.chevron}>⌄</span></Link><div className={styles.dropdown}><div className={styles.dropdownHead}><b>{item.label} theo tỉnh / thành</b><Link href={item.href}>Xem tất cả →</Link></div>{item.provinces.map(province=>{const key=`desktop:${item.label}:${province.label}`;const hasChildren=Boolean(province.children?.length);const isOpen=openProvinceKey===key;return <div key={province.label} className={styles.provinceGroup}><div className={styles.provinceHeader}><Link href={province.href} className={styles.provinceLink}><span>{province.label}</span></Link>{hasChildren?<button type="button" className={styles.provinceToggle} aria-label={`${isOpen?'Thu gọn':'Mở'} điểm du lịch ${province.label}`} aria-expanded={isOpen} onClick={()=>toggleProvince(key)}><span>⌄</span></button>:null}</div>{hasChildren&&isOpen?<div className={styles.provinceChildren}>{province.children!.map(child=><Link key={child.href} href={child.href} className={styles.destinationLink}><span><b>{child.label}</b></span><em>›</em></Link>)}</div>:null}</div>})}</div></div>:<Link key={item.label} href={item.href} aria-current={active(pathname,item.href)?'page':undefined}>{item.label}</Link>)}</nav></div>
 </header>
}
