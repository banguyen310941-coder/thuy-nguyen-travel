import type {Metadata} from 'next';
import { Suspense } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { StayCatalog } from '@/components/StayCatalog';
import {ContactCtaGroup} from '@/components/ContactCtaGroup';
import Link from 'next/link';

const canonical='https://banguyen310941-coder.github.io/thuy-nguyen-travel/stay';
export const metadata:Metadata={title:'Villa, Resort & Khách sạn',description:'Đặt Villa, Resort và Khách sạn toàn quốc cùng Thúy Nguyên Travel. Tìm theo điểm đến, ngày ở và số khách.',alternates:{canonical},openGraph:{title:'Villa, Resort & Khách sạn | Thúy Nguyên Travel',description:'Tìm Villa, Resort và Khách sạn toàn quốc theo ngày ở và số khách.',url:canonical,type:'website'}};

export default function StayPage() {
  return <div className="subpage">
    <section className="sub-hero"><div className="container"><div className="sub-breadcrumb"><Link href="/">Trang chủ</Link> / Lưu trú</div><div className="sub-hero-grid"><div><span className="sub-kicker">LƯU TRÚ TOÀN QUỐC</span><h1>Villa, Resort & Khách sạn</h1><p>Tìm chỗ nghỉ theo điểm đến, ngày ở, số khách và loại hình lưu trú. Kết quả được lọc theo tiêu chí bạn đã chọn.</p></div><ContactCtaGroup callLabel="Tư vấn đặt phòng"/></div></div></section>
    <nav className="sub-nav"><div className="container sub-nav-inner"><Link href="/stay">Tất cả lưu trú</Link><Link href="/stay?type=villa">Villa & Resort</Link><Link href="/stay?type=hotel">Khách sạn</Link><Link href="/destinations">Điểm đến</Link><Link href="/guide">Cẩm nang</Link></div></nav>
    <section className="sub-section white"><div className="container"><SearchBar /></div></section>
    <section className="sub-section"><div className="container"><Suspense fallback={<div className="sub-toolbar">Đang tải kết quả...</div>}><StayCatalog /></Suspense><div className="sub-cta"><div><h2>Cần kiểm tra phòng nhanh?</h2><p>Gửi ngày ở, số khách và điểm đến để Thúy Nguyên Travel kiểm tra phương án phù hợp.</p></div><ContactCtaGroup mode="footer" zaloLabel="Chat Zalo"/></div></div></section>
  </div>
}
