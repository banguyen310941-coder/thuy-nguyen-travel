import type {Metadata} from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { CruiseCatalog } from '@/components/CruiseCatalog';
import {ContactCtaGroup} from '@/components/ContactCtaGroup';

const canonical='https://banguyen310941-coder.github.io/thuy-nguyen-travel/cruises';
export const metadata:Metadata={title:'Du thuyền Hạ Long & Lan Hạ',description:'Đặt du thuyền Hạ Long, Lan Hạ và Ambassador cùng Thúy Nguyên Travel. Tư vấn hành trình và cabin theo ngày đi.',alternates:{canonical},openGraph:{title:'Du thuyền Hạ Long & Lan Hạ | Thúy Nguyên Travel',description:'Tìm du thuyền Hạ Long và Lan Hạ theo ngày đi, thời lượng và cabin.',url:canonical,type:'website'}};

export default function CruisesPage(){return <div className="subpage"><section className="sub-hero"><div className="container"><div className="sub-breadcrumb"><Link href="/">Trang chủ</Link> / Du thuyền</div><div className="sub-hero-grid"><div><span className="sub-kicker">AMBASSADOR & HẠ LONG</span><h1>Du thuyền Hạ Long & Lan Hạ</h1><p>Hành trình trong ngày, nghỉ đêm và trải nghiệm vịnh. Cabin và giá được kiểm tra theo ngày đi thực tế.</p></div><ContactCtaGroup callLabel="Kiểm tra cabin"/></div></div></section><nav className="sub-nav"><div className="container sub-nav-inner"><Link href="/cruises">Tất cả du thuyền</Link><Link href="/destinations">Điểm đến</Link><Link href="/tours">Tour kết hợp</Link><Link href="/guide">Cẩm nang</Link><Link href="/stay">Lưu trú</Link></div></nav><section className="sub-section"><div className="container"><Suspense fallback={<div className="sub-toolbar">Đang tải du thuyền...</div>}><CruiseCatalog/></Suspense><div className="sub-cta"><div><h2>Chưa biết nên đi 1 ngày hay ngủ đêm?</h2><p>Chúng tôi tư vấn hành trình theo thời gian, ngân sách và nhóm khách của bạn.</p></div><ContactCtaGroup mode="footer" callLabel="Gọi tư vấn" zaloLabel="Chat Zalo"/></div></div></section></div>}
