import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar';
import { PropertyCard } from '@/components/PropertyCard';
import { destinations, stays } from '@/data/catalog';

export default function HomePage() {
  return (
    <>
      <section className="hero hero-home">
        <div className="container">
          <p className="eyebrow">THÚY NGUYÊN TRAVEL</p>
          <h1>Tìm nơi lưu trú cho chuyến đi tiếp theo</h1>
          <p className="hero-copy">Tìm villa, khách sạn, resort, tour và du thuyền trên toàn quốc.</p>
        </div>
      </section>
      <section className="search-section"><div className="container"><SearchBar /></div></section>

      <section className="section">
        <div className="container">
          <div className="section-heading"><div><h2>Ưu đãi</h2><p>Những lựa chọn đáng chú ý cho chuyến đi sắp tới.</p></div></div>
          <div className="offer-grid">
            <div className="offer-card"><div><h3>Nhận giá tốt cho kỳ nghỉ gia đình</h3><p>Gửi ngày đi và số khách để chúng tôi kiểm tra villa, khách sạn phù hợp.</p><a className="primary-button" href="tel:0969973949">Nhận tư vấn</a></div></div>
            <div className="offer-card offer-photo"><div><h3>Villa & resort gần biển</h3><p>Oceanami, NovaWorld, Vinpearl và các điểm nghỉ dưỡng nổi bật.</p><Link className="light-button" href="/stay">Khám phá ngay</Link></div></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading"><div><h2>Khám phá Việt Nam</h2><p>Những điểm đến đang được tìm nhiều.</p></div><Link href="/destinations">Xem tất cả</Link></div>
          <div className="destination-grid">
            {destinations.map(([name, meta, image]) => (
              <Link className="destination-card" href="/destinations" key={name}>
                <div className="destination-image" style={{ backgroundImage: `url(${image})` }} />
                <div><h3>{name}</h3><p>{meta}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft-section">
        <div className="container">
          <div className="section-heading"><div><h2>Tìm theo loại chỗ nghỉ</h2><p>Chọn đúng loại hình cho kỳ nghỉ của bạn.</p></div></div>
          <div className="type-grid">
            <Link href="/stay" className="type-card"><span>🏨</span><h3>Khách sạn</h3><p>Phòng tiêu chuẩn đến 5 sao</p></Link>
            <Link href="/stay" className="type-card"><span>🏡</span><h3>Villa</h3><p>Không gian riêng cho gia đình</p></Link>
            <Link href="/stay" className="type-card"><span>🌴</span><h3>Resort</h3><p>Nghỉ dưỡng trọn gói</p></Link>
            <Link href="/cruises" className="type-card"><span>🛳️</span><h3>Du thuyền</h3><p>Hạ Long & Lan Hạ</p></Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading"><div><h2>Lưu trú nổi bật</h2><p>Sản phẩm khởi tạo cho hệ thống đặt phòng.</p></div><Link href="/stay">Xem tất cả</Link></div>
          <div className="property-grid">{stays.map((stay) => <PropertyCard stay={stay} key={stay.slug} />)}</div>
        </div>
      </section>

      <section className="section soft-section">
        <div className="container">
          <div className="section-heading"><div><h2>Tour & trải nghiệm</h2><p>Đặt tour và du thuyền trên cùng một website.</p></div></div>
          <div className="experience-grid">
            <Link href="/tours" className="experience-card"><div className="experience-image china" /><div><h3>Tour Trung Quốc</h3><p>Bắc Kinh · Thượng Hải · Hàng Châu · Ô Trấn</p></div></Link>
            <Link href="/tours" className="experience-card"><div className="experience-image vietnam" /><div><h3>Tour trong nước</h3><p>Đà Nẵng · Hội An · Phú Quốc · Tây Bắc</p></div></Link>
            <Link href="/cruises" className="experience-card"><div className="experience-image cruise" /><div><h3>Ambassador Cruise</h3><p>Hạ Long · Lan Hạ · Trong ngày & nghỉ đêm</p></div></Link>
          </div>
        </div>
      </section>
    </>
  );
}
