import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar';
import { PropertyCard } from '@/components/PropertyCard';
import { cruises, destinations, stays, tours } from '@/data/catalog';
import './home.css';

export const metadata = {
  title: 'Du lịch trọn gói - Nghỉ dưỡng đẳng cấp',
  description: 'Thúy Nguyên Travel - Tour, Villa, Resort, Khách sạn và Du thuyền toàn quốc. Hotline 0969 973 949.'
};

const serviceCards = [
  ['✈','Tour du lịch','Tour trong nước & quốc tế','/tours'],
  ['🏡','Villa & Resort','Nghỉ dưỡng cao cấp','/stay?type=villa'],
  ['🏨','Khách sạn','Đặt phòng toàn quốc','/stay?type=hotel'],
  ['🛳','Du thuyền','Hải trình tuyệt vời','/cruises'],
  ['🎁','Combo ưu đãi','Giá tốt · Tiết kiệm','/stay'],
];

export default function HomePage() {
  return (
    <>
      <section className="mock-hero">
        <div className="mock-hero-overlay" />
        <div className="container mock-hero-content">
          <p className="mock-eyebrow">THÚY NGUYÊN TRAVEL</p>
          <h1>Du lịch trọn gói – Nghỉ dưỡng đẳng cấp</h1>
          <p>Vé · Tour · Villa · Resort · Du thuyền – Khám phá thế giới cùng chúng tôi!</p>
          <div className="mock-hero-note"><span>✈</span><div>Hành trình của bạn<br/><b>Bắt đầu từ một giấc mơ...</b></div></div>
          <div className="mock-hero-search"><SearchBar /></div>
        </div>
      </section>

      <section className="mock-section mock-services-section">
        <div className="container">
          <div className="mock-section-heading center"><h2>Khám phá dịch vụ nổi bật</h2><p>Lựa chọn trải nghiệm phù hợp với bạn</p></div>
          <div className="mock-service-grid">{serviceCards.map(([icon,title,desc,href])=><Link href={href} className="mock-service-card" key={title}><span>{icon}</span><h3>{title}</h3><p>{desc}</p></Link>)}</div>
        </div>
      </section>

      <section className="mock-section">
        <div className="container">
          <div className="mock-section-heading"><div><h2>Điểm đến phổ biến</h2><div className="mock-pills"><span className="active">Trong nước</span><span>Quốc tế</span></div></div><Link href="/destinations">Xem tất cả →</Link></div>
          <div className="mock-destination-grid">{destinations.slice(0,6).map(([name,meta,image])=><Link href={`/stay?q=${encodeURIComponent(name)}`} className="mock-destination-card" key={name}><div className="mock-destination-image" style={{backgroundImage:`linear-gradient(0deg,rgba(3,30,54,.72),rgba(3,30,54,0) 60%),url(${image})`}}><div><h3>{name}</h3><p>{meta}</p></div></div></Link>)}</div>
        </div>
      </section>

      <section className="mock-section mock-soft">
        <div className="container">
          <div className="mock-section-heading"><div><h2>Sản phẩm nổi bật</h2><div className="mock-pills"><span className="active">Villa & Resort</span><span>Du thuyền</span><span>Khách sạn</span><span>Tour du lịch</span></div></div><Link href="/stay">Xem tất cả →</Link></div>
          <div className="mock-product-grid">{stays.slice(0,5).map((stay)=><PropertyCard stay={stay} key={stay.slug}/>)}</div>
        </div>
      </section>

      <section className="mock-section">
        <div className="container">
          <div className="mock-section-heading"><div><h2>Du thuyền nổi bật</h2><p>Hạ Long & Lan Hạ</p></div><Link href="/cruises">Xem tất cả →</Link></div>
          <div className="mock-tour-grid">{cruises.slice(0,3).map(item=><Link href="/cruises" className="mock-tour-card" key={item.slug}><div className="mock-tour-image" style={{backgroundImage:`url(${item.image})`}}/><div><small>{item.duration}</small><h3>{item.name}</h3><p>{item.summary}</p>{item.priceFrom&&<b>Từ {item.priceFrom}</b>}</div></Link>)}</div>
        </div>
      </section>

      <section className="mock-section mock-soft">
        <div className="container">
          <div className="mock-section-heading"><div><h2>Tour du lịch hot</h2><div className="mock-pills"><span className="active">Tour Trung Quốc</span><span>Tour trong nước</span></div></div><Link href="/tours">Xem tất cả →</Link></div>
          <div className="mock-tour-grid">{tours.slice(0,3).map(item=><Link href="/tours" className="mock-tour-card" key={item.slug}><div className="mock-tour-image" style={{backgroundImage:`url(${item.image})`}}/><div><small>{item.category} · {item.duration}</small><h3>{item.name}</h3><p>{item.summary}</p></div></Link>)}</div>
        </div>
      </section>

      <section className="mock-section">
        <div className="container mock-cta-strip"><div><span>THÚY NGUYÊN TRAVEL</span><h2>Khám phá thế giới, trải nghiệm khác biệt!</h2><p>Gọi ngay để được tư vấn tour, villa, khách sạn và du thuyền phù hợp.</p></div><div><a href="tel:0969973949" className="mock-call-cta">☎ 0969 973 949</a><a href="https://zalo.me/0969973949" className="mock-zalo-cta">Zalo</a></div></div>
      </section>
    </>
  );
}
