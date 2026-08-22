import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div><h3>THÚY NGUYÊN TRAVEL</h3><p>Tour, villa, khách sạn, resort và du thuyền toàn quốc.</p><p>Hotline: 0969 973 949</p></div>
        <div><h4>Lưu trú</h4><Link href="/stay">Villa</Link><Link href="/stay">Khách sạn</Link><Link href="/stay">Resort</Link></div>
        <div><h4>Du lịch</h4><Link href="/tours">Tour</Link><Link href="/cruises">Du thuyền</Link><Link href="/destinations">Điểm đến</Link></div>
        <div><h4>Thông tin</h4><Link href="/guide">Cẩm nang</Link><a href="tel:0969973949">Liên hệ</a></div>
      </div>
      <div className="container copyright">© 2026 Thúy Nguyên Travel.</div>
    </footer>
  );
}
