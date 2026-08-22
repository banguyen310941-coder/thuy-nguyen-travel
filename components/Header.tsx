import Link from 'next/link';

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
  return (
    <header className="site-header mock-header">
      <div className="mock-contactbar">
        <div className="container mock-contactbar-inner">
          <div className="mock-mini-contact"><span>☎ 0969 973 949</span><span>✉ info@thuynguyentravel.com</span></div>
          <div className="mock-top-actions"><a href="https://zalo.me/0969973949" target="_blank" rel="noreferrer">Zalo</a><a href="tel:0969973949">Gọi ngay</a></div>
        </div>
      </div>
      <div className="container mock-brand-row">
        <Link className="mock-logo" href="/" aria-label="Thúy Nguyên Travel">
          <span className="mock-logo-art" aria-hidden="true"><i className="sun"/><i className="palm">✦</i><i className="wave one"/><i className="wave two"/></span>
          <span className="mock-logo-text"><b>THÚY NGUYÊN</b><strong>TRAVEL</strong><small>Khám phá thế giới · Trải nghiệm khác biệt</small></span>
        </Link>
        <div className="mock-brand-tools"><span className="mock-search-mini">Tìm kiếm...</span><a href="tel:0969973949" className="mock-hotline">☎ 0969 973 949</a></div>
      </div>
      <div className="mock-nav-wrap">
        <nav className="container mock-nav" aria-label="Điều hướng chính">
          {nav.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
        </nav>
      </div>
    </header>
  );
}
