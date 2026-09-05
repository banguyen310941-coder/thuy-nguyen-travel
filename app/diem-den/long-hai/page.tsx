import type {Metadata} from 'next';
import Link from 'next/link';
import {ContactCtaGroup} from '@/components/ContactCtaGroup';

const canonical='https://happygo.vn/diem-den/long-hai';

export const metadata:Metadata={
 title:'Villa Long Hải: Oceanami, nghỉ dưỡng gần biển & kinh nghiệm đặt villa',
 description:'Tìm hiểu villa Long Hải, Oceanami, cách chọn căn gần biển, số phòng, tiện ích và kinh nghiệm kiểm tra giá trước khi đặt cùng HappyGo Travel.',
 keywords:['villa Long Hải','Oceanami Long Hải','villa Oceanami','nghỉ dưỡng Long Hải'],
 alternates:{canonical},
 openGraph:{title:'Villa Long Hải & Oceanami | HappyGo Travel',description:'Kinh nghiệm chọn villa Long Hải, Oceanami và đặt căn đúng nhu cầu.',url:canonical,type:'website',locale:'vi_VN'}
};

export default function Page(){
 const schema=[
  {'@context':'https://schema.org','@type':'TouristDestination',name:'Long Hải',description:'Điểm nghỉ dưỡng biển với lựa chọn villa và resort, gồm Oceanami Long Hải.',url:canonical},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
   {'@type':'ListItem',position:1,name:'Trang chủ',item:'https://happygo.vn'},
   {'@type':'ListItem',position:2,name:'Điểm đến',item:'https://happygo.vn/diem-den'},
   {'@type':'ListItem',position:3,name:'Long Hải',item:canonical}
  ]}
 ];
 return <main className="subpage">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
  <section className="sub-hero"><div className="container"><div className="sub-breadcrumb"><Link href="/">Trang chủ</Link> / <Link href="/diem-den">Điểm đến</Link> / Long Hải</div><div className="sub-hero-grid"><div><span className="sub-kicker">VILLA LONG HẢI</span><h1>Villa Long Hải &amp; Oceanami: chọn căn đúng nhu cầu</h1><p>Long Hải phù hợp kỳ nghỉ gia đình và nhóm bạn. Khi chọn villa, nên kiểm tra đúng mã căn, số phòng, sức chứa, khoảng cách ra biển và tiện ích thực tế.</p></div><ContactCtaGroup callLabel="Tư vấn villa Long Hải"/></div></div></section>
  <section className="sub-section white"><div className="container article-container"><div className="article-content"><h2>Kinh nghiệm chọn villa Long Hải</h2><p>Không nên chỉ so sánh theo số phòng ngủ. Hãy đối chiếu sức chứa, giường, không gian sinh hoạt chung, hồ bơi, bếp, BBQ và chính sách phụ thu theo đúng căn.</p><h2>Villa Oceanami Long Hải</h2><p>Với Oceanami, mã căn là thông tin quan trọng để đối chiếu ảnh và tiện ích. HappyGo Travel ưu tiên sử dụng ảnh đúng căn khi đã xác minh, đồng thời kiểm tra giá theo ngày trước khi xác nhận.</p><h2>Xem dịch vụ và cẩm nang</h2><div className="article-actions"><Link href="/luu-tru?q=Long%20H%E1%BA%A3i&type=villa">Xem villa Long Hải</Link><Link href="/cam-nang/danh-muc/long-hai">Cẩm nang Long Hải</Link><Link href="/cam-nang/villa-long-hai-kinh-nghiem-thue-gan-bien">Kinh nghiệm thuê villa Long Hải</Link></div></div><div className="sub-cta"><div><h2>Cần kiểm tra căn Oceanami?</h2><p>Gửi ngày ở và số khách để HappyGo Travel kiểm tra căn phù hợp.</p></div><ContactCtaGroup mode="footer" callLabel="Gọi tư vấn" zaloLabel="Chat Zalo"/></div></div></section>
 </main>;
}
