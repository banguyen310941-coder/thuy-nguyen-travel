import {notFound} from 'next/navigation';
import Link from 'next/link';
import {stays} from '@/data/catalog';
import {BookingInquiry} from '@/components/BookingInquiry';

export function generateStaticParams(){return stays.map(stay=>({slug:stay.slug}))}

export default async function StayDetailPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const stay=stays.find(item=>item.slug===slug);if(!stay)notFound();
 const gallery=stay.gallery?.length?stay.gallery:[stay.image,stay.image,stay.image];
 const isVilla=stay.type==='Villa';
 return <div className="product-detail-v2">
  <section className="pd-head"><div className="container"><div className="pd-breadcrumb"><Link href="/">Trang chủ</Link><span>›</span><Link href="/stay">Lưu trú</Link><span>›</span><b>{stay.name}</b></div><div className="pd-title"><div><span className="pd-type">{stay.type}</span><h1>{stay.name}</h1><p>📍 {stay.location}</p></div><div className="pd-rating"><span>Rất tốt</span><b>{stay.rating}</b></div></div></div></section>
  <section className="container pd-gallery"><div className="pd-main-img" style={{backgroundImage:`url(${gallery[0]})`}}/><div style={{backgroundImage:`url(${gallery[1]||gallery[0]})`}}/><div style={{backgroundImage:`url(${gallery[2]||gallery[0]})`}}/><button>📷 Xem album ảnh</button></section>
  <section className="container pd-summary-grid"><div className="pd-summary-card"><h2>{isVilla?'Villa nghỉ dưỡng phù hợp gia đình & nhóm':'Lưu trú nghỉ dưỡng cao cấp'}</h2><p>{stay.summary}</p><div className="pd-quick-info"><span>✓ {isVilla?'Villa nguyên căn / nhiều phòng ngủ':'Phòng & suite'}</span><span>✓ Check-in theo chính sách</span><span>✓ Hỗ trợ trẻ em / phụ thu</span><span>✓ Xác nhận giá theo ngày</span></div></div><div className="pd-price-card"><small>GIÁ TỐT NHẤT THEO NGÀY</small><strong>Liên hệ giá</strong><p>Giá thay đổi theo ngày ở, số khách và hạng {isVilla?'villa':'phòng'}.</p><a href="#booking">Kiểm tra giá & phòng trống</a><span>☎ 0969 973 949</span></div></section>
  <nav className="pd-tabs"><div className="container"><a href="#overview">Tổng quan</a><a href="#rooms">{isVilla?'Hạng Villa':'Hạng phòng'}</a><a href="#amenities">Tiện ích</a><a href="#policy">Chính sách</a><a href="#reviews">Đánh giá</a><a href="#faq">Hỏi đáp</a></div></nav>
  <section className="container pd-body"><main>
   <section id="overview" className="pd-block"><h2>Tổng quan</h2><p>{stay.summary}</p><div className="pd-highlight-grid">{stay.highlights.map(item=><div key={item}>✓ <b>{item}</b></div>)}</div></section>
   <section id="rooms" className="pd-block"><div className="pd-block-title"><div><h2>{isVilla?'Hạng Villa & giá tham khảo':'Hạng phòng & giá tham khảo'}</h2><p>Chọn hạng phù hợp rồi gửi yêu cầu để nhận giá theo ngày.</p></div></div><div className="pd-room-list">{(stay.rooms||[isVilla?'Villa tiêu chuẩn':'Phòng tiêu chuẩn','Hạng gia đình']).map((room,i)=><article key={room}><div className="pd-room-photo" style={{backgroundImage:`url(${gallery[i%gallery.length]})`}}/><div><h3>{room}</h3><p>{isVilla?'Sức chứa linh hoạt · không gian riêng · chính sách theo từng hạng':'Sức chứa theo hạng phòng · giường và view xác nhận theo lựa chọn'}</p><span>✓ Wifi</span><span>✓ Điều hòa</span><span>✓ {isVilla?'Không gian sinh hoạt':'Dọn phòng'}</span></div><div><small>Giá theo ngày</small><strong>Liên hệ</strong><a href="#booking">Chọn</a></div></article>)}</div></section>
   <section id="amenities" className="pd-block"><h2>Tiện ích nổi bật</h2><div className="pd-highlight-grid">{stay.highlights.map(item=><div key={item}>✦ <b>{item}</b></div>)}</div></section>
   <section id="policy" className="pd-block"><h2>Chính sách lưu trú</h2><div className="pd-policy-grid"><div><b>Nhận / trả phòng</b><p>Giờ nhận và trả phòng được xác nhận theo từng sản phẩm/hạng phòng.</p></div><div><b>Trẻ em</b><p>Phụ thu tùy độ tuổi, hạng phòng và số khách thực tế.</p></div><div><b>Đặt cọc</b><p>Mức cọc được xác nhận khi giữ chỗ.</p></div><div><b>Hoàn hủy</b><p>Áp dụng theo gói giá và thời điểm đặt.</p></div></div></section>
   <section id="reviews" className="pd-block"><h2>Đánh giá</h2><div className="pd-review-summary"><b>{stay.rating}/10</b><div><strong>Rất tốt</strong><p>Điểm đánh giá tổng hợp sẽ được quản lý trong CMS.</p></div></div></section>
   <section id="faq" className="pd-block"><h2>Câu hỏi thường gặp</h2><details><summary>Giá đã bao gồm thuế phí chưa?</summary><p>Giá cuối cùng sẽ được tư vấn và xác nhận trước khi đặt cọc.</p></details><details><summary>Có thể đặt cho nhóm gia đình đông người không?</summary><p>Có. Thúy Nguyên Travel sẽ tư vấn hạng phù hợp với số người lớn, trẻ em và nhu cầu phòng ngủ.</p></details></section>
  </main><aside id="booking"><BookingInquiry product={stay.name} kind={isVilla?'villa / resort':'khách sạn'}/></aside></section>
 </div>
}
