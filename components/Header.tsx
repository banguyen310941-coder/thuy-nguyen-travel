import Link from 'next/link';

const nav = [
  ['Lưu trú', '/stay'],
  ['Villa', '/stay?type=villa'],
  ['Khách sạn', '/stay?type=hotel'],
  ['Tour', '/tours'],
  ['Du thuyền', '/cruises'],
  ['Cẩm nang', '/guide'],
];

export function Header() {
  return (
    <header className="site-header">
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>Tour • Villa • Khách sạn • Du thuyền toàn quốc</span>
          <span>Hỗ trợ đặt dịch vụ: <a href="tel:0969973949"><b>0969 973 949</b></a></span>
        </div>
      </div>
      <div className="container header-row">
        <Link className="brand" href="/" aria-label="Thúy Nguyên Travel">
          <span className="brand-mark"><span>TN</span><i>✦</i></span>
          <span><b>THÚY NGUYÊN</b><small>TRAVEL</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Điều hướng chính">
          {nav.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          <a className="zalo-button" href="https://zalo.me/0969973949" target="_blank" rel="noreferrer">Zalo</a>
          <a className="hotline-button" href="tel:0969973949">☎ 0969 973 949</a>
        </div>
      </div>
      <nav className="mobile-nav container" aria-label="Điều hướng mobile">
        {nav.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
      </nav>
    </header>
  );
}
