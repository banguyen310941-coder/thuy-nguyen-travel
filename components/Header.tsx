'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef} from 'react';
import {useSiteSettings} from '@/components/useSiteSettings';
import {HappyGoLogo} from '@/components/HappyGoLogo';
import {CustomerAccountBadge} from '@/components/CustomerAccount';

const nav=[
 {label:'Trang chủ',href:'/'},
 {label:'Tour du lịch',href:'/tour-du-lich'},
 {label:'Villa & Resort',href:'/villa-resort'},
 {label:'Khách sạn',href:'/khach-san'},
 {label:'Du thuyền',href:'/du-thuyen'},
 {label:'Điểm đến',href:'/diem-den'},
 {label:'Cẩm nang',href:'/cam-nang'},
];
function active(pathname:string,href:string){return href==='/'?pathname==='/' : pathname===href||pathname.startsWith(`${href}/`)}
export function Header(){const pathname=usePathname();const menuRef=useRef<HTMLDetailsElement>(null);const settings=useSiteSettings();const closeMobileMenu=()=>{if(menuRef.current)menuRef.current.open=false};useEffect(()=>{closeMobileMenu()},[pathname]);useEffect(()=>{const p=(e:PointerEvent)=>{const m=menuRef.current;if(m?.open&&!m.contains(e.target as Node))m.open=false};const k=(e:KeyboardEvent)=>{if(e.key==='Escape')closeMobileMenu()};document.addEventListener('pointerdown',p);document.addEventListener('keydown',k);return()=>{document.removeEventListener('pointerdown',p);document.removeEventListener('keydown',k)}},[]);return <header className="site-header mock-header"><div className="mock-contactbar"><div className="container mock-contactbar-inner"><div className="mock-mini-contact"><span>✉ {settings.email}</span></div><div className="mock-top-actions"><a href={`https://zalo.me/${settings.zalo.replace(/\D/g,'')}`} target="_blank" rel="noreferrer">Zalo</a><Link href="/partner">Đối tác</Link></div></div></div><div className="mock-mobile-head container"><details className="mobile-menu" ref={menuRef}><summary className="mock-mobile-icon" aria-label="Mở menu">☰</summary><nav className="mobile-menu-panel">{nav.map(item=><Link key={item.label} href={item.href} aria-current={active(pathname,item.href)?'page':undefined} onClick={closeMobileMenu}>{item.label}</Link>)}<Link href="/tai-khoan" onClick={closeMobileMenu}>👤 Tài khoản khách hàng</Link></nav></details><Link className="mock-mobile-logo happygo-link" href="/"><HappyGoLogo compact/></Link><Link className="mock-mobile-icon" href="/tai-khoan" aria-label="Tài khoản khách hàng">👤</Link></div><div className="container mock-brand-row"><Link className="mock-logo happygo-link" href="/"><HappyGoLogo/></Link><div className="mock-brand-tools"><Link href="/tim-kiem" className="mock-search-mini">⌕ Tìm kiếm...</Link><CustomerAccountBadge/></div></div><div className="mock-nav-wrap"><nav className="container mock-nav">{nav.map(item=><Link key={item.label} href={item.href} aria-current={active(pathname,item.href)?'page':undefined}>{item.label}</Link>)}</nav></div></header>}
