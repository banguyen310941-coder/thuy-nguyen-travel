'use client';

import Link from 'next/link';
import {formatPhone,useSiteSettings} from '@/components/useSiteSettings';

export function Footer() {
  const settings=useSiteSettings();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div><h3>{settings.brand.toUpperCase()}</h3><p>Tour, villa, khách sạn, resort và du thuyền toàn quốc.</p><p>Hotline: <a href={`tel:${settings.hotline}`}>{formatPhone(settings.hotline)}</a></p><p>Email: <a href={`mailto:${settings.email}`}>{settings.email}</a></p></div>
        <div><h4>Lưu trú</h4><Link href="/stay?type=villa">Villa & Resort</Link><Link href="/stay?type=hotel">Khách sạn</Link><Link href="/stay?type=resort">Resort</Link></div>
        <div><h4>Du lịch</h4><Link href="/tours">Tour</Link><Link href="/cruises">Du thuyền</Link><Link href="/destinations">Điểm đến</Link></div>
        <div><h4>Thông tin</h4><Link href="/guide">Cẩm nang</Link><Link href="/search">Tìm kiếm</Link><a href={`https://zalo.me/${settings.zalo}`} target="_blank" rel="noreferrer">Zalo tư vấn</a></div>
      </div>
      <div className="container copyright">© 2026 {settings.brand}.</div>
    </footer>
  );
}
