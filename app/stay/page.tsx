import { Suspense } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { StayCatalog } from '@/components/StayCatalog';
import Link from 'next/link';

export const metadata = { title: 'Villa, Resort & Khách sạn' };

export default function StayPage() {
  return <div className="subpage">
    <section className="sub-hero"><div className="container"><div className="sub-breadcrumb"><Link href="/">Trang chủ</Link> / Lưu trú</div><div className="sub-hero-grid"><div><span className="sub-kicker">LƯU TRÚ TOÀN QUỐC</span><h1>Villa, Resort & Khách sạn</h1><p>Tìm chỗ nghỉ theo điểm đến, ngày ở, số khách và loại hình lưu trú. Kết quả được lọc theo tiêu chí bạn đã chọn.</p></div><div className="sub-hero-cta"><a className="solid" href="tel:0969973949">☎ Tư vấn đặt phòng</a><a className="outline" href="https://zalo.me/0969973949">Zalo</a></div></div></div></section>
    <nav className="sub-nav"><div className="container sub-nav-inner"><Link href="/stay">Tất cả lưu trú</Link><Link href="/stay?type=villa">Villa & Resort</Link><Link href="/stay?type=hotel">Khách sạn</Link><Link href="/destinations">Điểm đến</Link><Link href="/guide">Cẩm nang</Link></div></nav>
    <section className="sub-section white"><div className="container"><SearchBar /></div></section>
    <section className="sub-section"><div className="container"><Suspense fallback={<div className="sub-toolbar">Đang tải kết quả...</div>}><StayCatalog /></Suspense><div className="sub-cta"><div><h2>Cần kiểm tra phòng nhanh?</h2><p>Gửi ngày ở, số khách và điểm đến để Thúy Nguyên Travel kiểm tra phương án phù hợp.</p></div><div className="sub-cta-actions"><a className="call" href="tel:0969973949">☎ 0969 973 949</a><a className="zalo" href="https://zalo.me/0969973949">Chat Zalo</a></div></div></div></section>
  </div>
}
