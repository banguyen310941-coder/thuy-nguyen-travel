import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar';
import { PropertyCard } from '@/components/PropertyCard';
import { cruises, destinations, stays, tours } from '@/data/catalog';

export const metadata = {
  title: 'Đặt tour, villa, khách sạn & du thuyền toàn quốc',
  description: 'Thúy Nguyên Travel - tìm và đặt villa, khách sạn, resort, tour và du thuyền toàn quốc. Hotline 0969 973 949.'
};

export default function HomePage() {
  return (
    <>
      <section className="hero hero-home">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">THÚY NGUYÊN TRAVEL</p>
            <h1>Đi đâu cũng có lựa chọn phù hợp.</h1>
            <p className="hero-copy">Tìm villa, khách sạn, resort, tour và du thuyền trên toàn quốc với một hệ thống đặt dịch vụ thống nhất.</p>
          </div>
          <div className="hero-trust">
            <b>0969 973 949</b>
            <span>Tư vấn nhanh qua điện thoại & Zalo</span>
          </div>
        </div>
      </section>
      <section className="search-section"><div className="container"><SearchBar /></div></section>

      <section className="section compact-section">
        <div className="container service-shortcuts">
          <Link href="/stay?type=villa"><span>🏡</span><b>Villa</b><small>Oceanami · NovaWorld</small></Link>
          <Link href="/stay?type=hotel"><span>🏨</span><b>Khách sạn</b><small>Vinpearl · FLC</small></Link>
          <Link href="/cruises"><span>🛳️</span><b>Du thuyền</b><small>Ambassador</small></Link>
          <Link href="/tours"><span>🧳</span><b>Tour du lịch</b><small>Trong nước · Trung Quốc</small></Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading"><div><h2>Ưu đãi & gợi ý hôm nay</h2><p>Chọn nhanh dịch vụ phù hợp rồi gửi ngày đi để nhận giá thực tế.</p></div></div>
          <div className="offer-grid">
            <div className="offer-card"><div><span className="offer-kicker">KỲ NGHỈ GIA ĐÌNH</span><h3>Villa biển cho nhóm 6–10 khách</h3><p>Oceanami và NovaWorld Phan Thiết với nhiều lựa chọn số phòng ngủ.</p><Link className="primary-button" href="/stay?type=villa">Xem villa</Link></div></div>
            <div className="offer-card offer-photo"><div><span className="offer-kicker">HẠ LONG & LAN HẠ</span><h3>Ambassador Cruise</h3><p>Hành trình trong ngày hoặc ngủ đêm trên vịnh.</p><Link className="light-button" href="/cruises">Xem du thuyền</Link></div></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading"><div><h2>Khám phá Việt Nam</h2><p>Những điểm đến có nhiều lựa chọn lưu trú và tour.</p></div><Link href="/destinations">Xem tất cả</Link></div>
          <div className="destination-grid">
            {destinations.map(([name, meta, image]) => (
              <Link className="destination-card" href={`/stay?q=${encodeURIComponent(name)}`} key={name}>
                <div className="destination-image" style={{ backgroundImage: `url(${image})` }} />
                <div><h3>{name}</h3><p>{meta}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft-section">
        <div className="container">
          <div className="section-heading"><div><h2>Lưu trú nổi bật</h2><p>Villa, khách sạn và resort được đưa vào hệ thống đầu tiên.</p></div><Link href="/stay">Xem tất cả</Link></div>
          <div className="property-grid">{stays.slice(0, 6).map((stay) => <PropertyCard stay={stay} key={stay.slug} />)}</div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading"><div><h2>Du thuyền Ambassador</h2><p>Hạ Long và Lan Hạ với lựa chọn trong ngày hoặc nghỉ đêm.</p></div><Link href="/cruises">Xem tất cả</Link></div>
          <div className="experience-grid">{cruises.map((item)=><Link href="/cruises" className="experience-card" key={item.slug}><div className="experience-image" style={{backgroundImage:`url(${item.image})`}}/><div><small>{item.bay} · {item.duration}</small><h3>{item.name}</h3><p>{item.summary}</p>{item.priceFrom && <b className="from-price">Từ {item.priceFrom}</b>}</div></Link>)}</div>
        </div>
      </section>

      <section className="section soft-section">
        <div className="container">
          <div className="section-heading"><div><h2>Tour được quan tâm</h2><p>Khởi tạo nhóm tour Trung Quốc và tour trong nước.</p></div><Link href="/tours">Xem tất cả</Link></div>
          <div className="experience-grid">{tours.slice(0,3).map((item)=><Link href="/tours" className="experience-card" key={item.slug}><div className="experience-image" style={{backgroundImage:`url(${item.image})`}}/><div><small>{item.category} · {item.duration}</small><h3>{item.name}</h3><p>{item.summary}</p></div></Link>)}</div>
        </div>
      </section>

      <section className="section">
        <div className="container editorial-callout">
          <div><span>CẨM NANG DU LỊCH</span><h2>Thông tin trước chuyến đi, viết để khách dễ quyết định hơn.</h2><p>Kinh nghiệm chọn villa, lịch trình điểm đến, tư vấn du thuyền, khách sạn và các bài SEO theo từng địa phương.</p></div>
          <Link className="primary-button" href="/guide">Đọc cẩm nang</Link>
        </div>
      </section>
    </>
  );
}
