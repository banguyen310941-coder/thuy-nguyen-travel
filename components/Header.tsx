'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef} from 'react';
import {formatPhone,useSiteSettings} from '@/components/useSiteSettings';

const nav = [
  ['Trang chủ', '/'],
  ['Tour du lịch', '/tours'],
  ['Villa & Resort', '/stay?type=villa'],
  ['Khách sạn', '/stay?type=hotel'],
  ['Du thuyền', '/cruises'],
  ['Điểm đến', '/destinations'],
  ['Cẩm nang', '/guide'],
];

export function Header() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const settings=useSiteSettings();
  const phone=formatPhone(settings.hotline);

  const closeMobileMenu = () => { if (menuRef.current) menuRef.current.open = false; };
  useEffect(() => { closeMobileMenu(); }, [pathname]);
  useEffect(() => { const handlePointerDown = (event: PointerEvent) => { const menu = menuRef.current; if (menu?.open && !menu.contains(event.target as Node)) menu.open = false; }; const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') closeMobileMenu(); }; document.addEventListener('pointerdown', handlePointerDown); document.addEventListener('keydown', handleEscape); return () => { document.removeEventListener('pointerdown', handlePointerDown); document.removeEventListener('keydown', handleEscape); }; }, []);

  return <header className="site-header mock-header">
    <div className="mock-contactbar"><div className="container mock-contactbar-inner"><div className="mock-mini-contact"><span>☎ {phone}</span><span>✉ {settings.email}</span></div><div className="mock-top-actions"><Link href="/booking-lookup">Tra cứu booking</Link><Link href="/account">Tài khoản</Link><a href={`https://zalo.me/${settings.zalo}`} target="_blank" rel="noreferrer">Zalo</a><a href={`tel:${settings.hotline}`}>Gọi ngay</a></div></div></div>
    <div className="mock-mobile-head container"><details className="mobile-menu" ref={menuRef}><summary className="mock-mobile-icon" aria-label="Mở menu">☰</summary><nav className="mobile-menu-panel" aria-label="Menu điện thoại">{nav.map(([label, href]) => <Link key={label} href={href} onClick={closeMobileMenu}>{label}</Link>)}<Link href="/booking-lookup" onClick={closeMobileMenu}>⌕ Tra cứu booking</Link><Link href="/account" onClick={closeMobileMenu}>👤 Khu vực khách hàng</Link><a href={`tel:${settings.hotline}`} onClick={closeMobileMenu}>☎ Gọi {phone}</a><a href={`https://zalo.me/${settings.zalo}`} target="_blank" rel="noreferrer" onClick={closeMobileMenu}>Zalo tư vấn</a></nav></details><Link className="mock-mobile-logo" href="/" aria-label={settings.brand} onClick={closeMobileMenu}><span className="mock-logo-art" aria-hidden="true"><i className="sun"/><i className="palm">✦</i><i className="wave one"/><i className="wave two"/></span><span className="mock-logo-text"><b>THÚY NGUYÊN</b><strong>TRAVEL</strong></span></Link><Link className="mock-mobile-icon" href="/account" aria-label="Khu vực khách hàng" onClick={closeMobileMenu}>♙</Link></div>
    <div className="container mock-brand-row"><Link className="mock-logo" href="/" aria-label={settings.brand}><span className="mock-logo-art" aria-hidden="true"><i className="sun"/><i className="palm">✦</i><i className="wave one"/><i className="wave two"/></span><span className="mock-logo-text"><b>THÚY NGUYÊN</b><strong>TRAVEL</strong><small>Khám phá thế giới · Trải nghiệm khác biệt</small></span></Link><div className="mock-brand-tools"><Link href="/search" className="mock-search-mini" aria-label="Mở tìm kiếm">⌕ Tìm kiếm...</Link><Link href="/booking-lookup" className="mock-search-mini">⌕ Tra cứu booking</Link><a href={`tel:${settings.hotline}`} className="mock-hotline">☎ {phone}</a></div></div>
    <div className="mock-nav-wrap"><nav className="container mock-nav" aria-label="Điều hướng chính">{nav.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav></div>
  </header>;
}
