import Link from 'next/link';

const nav = [
  ['Lưu trú', '/stay'],
  ['Tour', '/tours'],
  ['Du thuyền', '/cruises'],
  ['Điểm đến', '/destinations'],
  ['Cẩm nang', '/guide'],
];

export function Header() {
  return (
    <header className="site-header">
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>Tour • Villa • Khách sạn • Du thuyền toàn quốc</span>
          <a href="tel:0969973949">Hotline: 0969 973 949</a>
        </div>
      </div>
      <div className="container header-row">
        <Link className="brand" href="/">
          <span className="brand-mark">TN</span>
          <span><b>THÚY NGUYÊN</b><small>TRAVEL & STAY</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Điều hướng chính">
          {nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          <a className="zalo-button" href="https://zalo.me/0969973949">Zalo</a>
          <a className="hotline-button" href="tel:0969973949">☎ 0969 973 949</a>
        </div>
      </div>
      <nav className="mobile-nav container" aria-label="Điều hướng mobile">
        {nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
    </header>
  );
}
