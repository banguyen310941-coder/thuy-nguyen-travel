import type {Metadata} from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { TourCatalog } from '@/components/TourCatalog';
import {ContactCtaGroup} from '@/components/ContactCtaGroup';

const canonical='https://banguyen310941-coder.github.io/thuy-nguyen-travel/tours';
export const metadata:Metadata={title:'Tour trong nước & Tour Trung Quốc',description:'Tour trong nước và Tour Trung Quốc cùng Thúy Nguyên Travel. Lịch khởi hành, hành trình và tư vấn theo nhu cầu.',alternates:{canonical},openGraph:{title:'Tour trong nước & Tour Trung Quốc | Thúy Nguyên Travel',description:'Khám phá Tour trong nước và Tour Trung Quốc với lịch trình rõ ràng.',url:canonical,type:'website'}};

export default function ToursPage(){return <div className="subpage"><section className="sub-hero"><div className="container"><div className="sub-breadcrumb"><Link href="/">Trang chủ</Link> / Tour du lịch</div><div className="sub-hero-grid"><div><span className="sub-kicker">TOUR DU LỊCH</span><h1>Tour trong nước & Trung Quốc</h1><p>Chọn hành trình theo điểm đến, thời lượng và loại tour. Lịch khởi hành và giá được xác nhận theo từng thời điểm.</p></div><ContactCtaGroup callLabel="Tư vấn tour"/></div></div></section><nav className="sub-nav"><div className="container sub-nav-inner"><Link href="/tours">Tất cả tour</Link><Link href="/destinations">Điểm đến</Link><Link href="/guide">Cẩm nang</Link><Link href="/stay">Lưu trú</Link><Link href="/cruises">Du thuyền</Link></div></nav><section className="sub-section"><div className="container"><Suspense fallback={<div className="sub-toolbar">Đang tải tour...</div>}><TourCatalog/></Suspense><div className="sub-cta"><div><h2>Cần tour riêng cho gia đình hoặc doanh nghiệp?</h2><p>Gửi số khách, ngày đi và điểm đến để chúng tôi thiết kế hành trình phù hợp.</p></div><ContactCtaGroup mode="footer" callLabel="Gọi tư vấn" zaloLabel="Chat Zalo"/></div></div></section></div>}
