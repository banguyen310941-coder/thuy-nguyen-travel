import Link from 'next/link';
import {GuideArticleReader} from '@/components/GuideArticleReader';
import {PublicServiceNav} from '@/components/PublicServiceNav';

export const metadata={title:'Bài viết Cẩm nang | HappyGo Travel',description:'Bài viết cẩm nang du lịch, kinh nghiệm đặt tour, Villa & Resort, khách sạn và du thuyền từ HappyGo Travel.',robots:{index:true,follow:true}};

export default function GuideReadPage(){return <div className="subpage"><section className="sub-hero compact"><div className="container"><div className="sub-breadcrumb"><Link href="/">Trang chủ</Link> / <Link href="/cam-nang">Cẩm nang</Link> / Bài viết</div><div className="sub-hero-grid"><div><span className="sub-kicker">CẨM NANG HAPPYGO TRAVEL</span><h1>Kinh nghiệm & thông tin chuyến đi</h1><p>Nội dung được quản lý và xuất bản từ hệ thống Cẩm nang HappyGo Travel.</p></div></div></div></section><PublicServiceNav active="guide"/><section className="sub-section white"><div className="container article-container"><GuideArticleReader/></div></section></div>}
