'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef} from 'react';

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

  const closeMobileMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  useEffect(() => { closeMobileMenu(); }, [pathname]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const menu = menuRef.current;
      if (menu?.open && !menu.contains(event.target as Node)) menu.open = false;
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileMenu();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <header className="site-header mock-header">
      <div className="mock-contactbar">
        <div className="container mock-contactbar-inner">
          <div className="mock-mini-contact"><span>☎ 0969 973 949</span><span>✉ info@thuynguyentravel.com</span></div>
          <div className="mock-top-actions"><a href="https://zalo.me/0969973949" target="_blank" rel="noreferrer">Zalo</a><a href="tel:0969973949">Gọi ngay</a></div>
        </div>
      </div>

      <div className="mock-mobile-head container">
        <details className="mobile-menu" ref={menuRef}>
          <summary className="mock-mobile-icon" aria-label="Mở menu">☰</summary>
          <nav className="mobile-menu-panel" aria-label="Menu điện thoại">
            {nav.map(([label, href]) => <Link key={label} href={href} onClick={closeMobileMenu}>{label}</Link>)}
            <a href="tel:0969973949" onClick={closeMobileMenu}>☎ Gọi 0969 973 949</a>
            <a href="https://zalo.me/0969973949" target="_blank" rel="noreferrer" onClick={closeMobileMenu}>Zalo tư vấn</a>
          </nav>
        </details>
        <Link className="mock-mobile-logo" href="/" aria-label="Thúy Nguyên Travel" onClick={closeMobileMenu}>
          <span className="mock-logo-art" aria-hidden="true"><i className="sun"/><i className="palm">✦</i><i className="wave one"/><i className="wave two"/></span>
          <span className="mock-logo-text"><b>THÚY NGUYÊN</b><strong>TRAVEL</strong></span>
        </Link>
        <Link className="mock-mobile-icon" href="/search" aria-label="Tìm kiếm" onClick={closeMobileMenu}>⌕</Link>
      </div>

      <div className="container mock-brand-row">
        <Link className="mock-logo" href="/" aria-label="Thúy Nguyên Travel">
          <span className="mock-logo-art" aria-hidden="true"><i className="sun"/><i className="palm">✦</i><i className="wave one"/><i className="wave two"/></span>
          <span className="mock-logo-text"><b>THÚY NGUYÊN</b><strong>TRAVEL</strong><small>Khám phá thế giới · Trải nghiệm khác biệt</small></span>
        </Link>
        <div className="mock-brand-tools"><Link href="/search" className="mock-search-mini" aria-label="Mở tìm kiếm">⌕ Tìm kiếm...</Link><a href="tel:0969973949" className="mock-hotline">☎ 0969 973 949</a></div>
      </div>
      <div className="mock-nav-wrap">
        <nav className="container mock-nav" aria-label="Điều hướng chính">
          {nav.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
        </nav>
      </div>
    </header>
  );
}
