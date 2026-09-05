import Link from 'next/link';
import {GuideArticleReader} from '@/components/GuideArticleReader';

export const metadata={title:'Bài viết Cẩm nang | Thúy Nguyên Travel',description:'Bài viết cẩm nang du lịch, kinh nghiệm đặt tour, lưu trú và du thuyền từ Thúy Nguyên Travel.',robots:{index:true,follow:true}};

export default function GuideReadPage(){return <div className="subpage"><section className="sub-hero compact"><div className="container"><div className="sub-breadcrumb"><Link href="/">Trang chủ</Link> / <Link href="/cam-nang">Cẩm nang</Link> / Bài viết</div><div className="sub-hero-grid"><div><span className="sub-kicker">CẨM NANG THÚY NGUYÊN TRAVEL</span><h1>Kinh nghiệm & thông tin chuyến đi</h1><p>Nội dung được quản lý từ hệ thống CMS của website.</p></div></div></div></section><section className="sub-section white"><div className="container article-container"><GuideArticleReader/></div></section></div>}
