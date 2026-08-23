import {Suspense} from 'react';
import Link from 'next/link';
import {GlobalSearchResults} from '@/components/GlobalSearchResults';
import {SearchBar} from '@/components/SearchBar';
import {SupportCtas} from '@/components/SupportCtas';

export const metadata={title:'Tìm kiếm dịch vụ du lịch',description:'Tìm Tour, Villa, Khách sạn và Du thuyền cùng Thúy Nguyên Travel.',robots:{index:false,follow:true}};

export default function SearchPage(){return <div className="subpage"><section className="sub-hero"><div className="container"><div className="sub-breadcrumb"><Link href="/">Trang chủ</Link> / Tìm kiếm</div><div className="sub-hero-grid"><div><span className="sub-kicker">TÌM KIẾM TOÀN BỘ</span><h1>Tour, Villa, Khách sạn & Du thuyền</h1><p>Kết quả được chia riêng theo từng loại dịch vụ để bạn chọn đúng sản phẩm cần tìm.</p></div><div className="sub-hero-cta"><SupportCtas compact/></div></div></div></section><section className="sub-section white"><div className="container"><SearchBar/></div></section><section className="sub-section"><div className="container"><Suspense fallback={<div className="sub-toolbar">Đang tìm dịch vụ...</div>}><GlobalSearchResults/></Suspense></div></section></div>}
