import type {Metadata} from 'next';
import Link from 'next/link';
import { destinations } from '@/data/catalog';
import {ContactCtaGroup} from '@/components/ContactCtaGroup';

const canonical='https://banguyen310941-coder.github.io/thuy-nguyen-travel/destinations';
export const metadata:Metadata={title:'Điểm đến nổi bật',description:'Khám phá điểm đến nổi bật cho Villa, Khách sạn, Tour và Du thuyền cùng Thúy Nguyên Travel.',alternates:{canonical},openGraph:{title:'Điểm đến nổi bật | Thúy Nguyên Travel',description:'Chọn điểm đến và xem dịch vụ phù hợp nhất cho chuyến đi.',url:canonical,type:'website'}};

function destinationHref(name:string){
  const n=name.toLowerCase();
  if(n.includes('hạ long')||n.includes('lan hạ')) return `/cruises?q=${encodeURIComponent(name)}`;
  if(n.includes('trung quốc')||n.includes('bắc kinh')||n.includes('thượng hải')||n.includes('hàng châu')) return `/tours?q=${encodeURIComponent(name)}`;
  return `/stay?q=${encodeURIComponent(name)}`;
}
function destinationAction(name:string){
  const n=name.toLowerCase();
  if(n.includes('hạ long')||n.includes('lan hạ')) return 'Xem du thuyền';
  if(n.includes('trung quốc')||n.includes('bắc kinh')||n.includes('thượng hải')||n.includes('hàng châu')) return 'Xem tour';
  return 'Xem lưu trú';
}

export default function DestinationsPage(){return <div className="subpage"><section className="sub-hero"><div className="container"><div className="sub-breadcrumb"><Link href="/">Trang chủ</Link> / Điểm đến</div><div className="sub-hero-grid"><div><span className="sub-kicker">KHÁM PHÁ VIỆT NAM</span><h1>Điểm đến nổi bật</h1><p>Chọn điểm đến trước, sau đó xem villa, khách sạn, tour và trải nghiệm phù hợp trong cùng một hành trình.</p></div><div className="sub-hero-cta"><Link className="solid" href="/stay">Tìm chỗ nghỉ</Link><Link className="outline" href="/tours">Xem tour</Link></div></div></div></section><nav className="sub-nav"><div className="container sub-nav-inner"><Link href="/destinations">Tất cả điểm đến</Link><Link href="/stay">Villa & Khách sạn</Link><Link href="/tours">Tour du lịch</Link><Link href="/cruises">Du thuyền</Link><Link href="/guide">Cẩm nang</Link></div></nav><section className="sub-section white"><div className="container"><div className="sub-heading"><div><h2>Chọn nơi bạn muốn đến</h2><p>Mỗi điểm đến sẽ dẫn tới loại dịch vụ phù hợp nhất thay vì đưa tất cả về một danh sách chung.</p></div></div><div className="destination-catalog">{destinations.map(([name,meta,image])=><article className="destination-tile" key={name} style={{backgroundImage:`url(${image})`}}><div className="destination-tile-content"><h3>{name}</h3><p>{meta}</p><Link href={destinationHref(name)}>{destinationAction(name)} tại {name} →</Link></div></article>)}</div><div className="sub-cta"><div><h2>Muốn ghép chỗ nghỉ + tour trong một chuyến?</h2><p>Liên hệ Thúy Nguyên Travel để được tư vấn combo phù hợp với số khách và thời gian.</p></div><ContactCtaGroup mode="footer" callLabel="Gọi tư vấn" zaloLabel="Zalo"/></div></div></section></div>}
