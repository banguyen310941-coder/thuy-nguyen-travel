'use client';

import Link from 'next/link';
import {Suspense} from 'react';
import {BookingInquiry} from '@/components/BookingInquiry';
import {PublishedUnits} from '@/components/PublishedUnits';
import {CustomerReviews} from '@/components/CustomerReviews';
import {ProductGallery} from '@/components/ProductGallery';
import {ProductLocationMap} from '@/components/ProductLocationMap';
import {ProductRateCalendar} from '@/components/ProductRateCalendar';
import {PublicServiceNav} from '@/components/PublicServiceNav';
import {amenityOptions,inferAmenityTags} from '@/components/ProductAmenityModel';
import {allSeasonalPriceCandidates} from '@/lib/pricing-calendar';
import type {PublicRateRange} from '@/lib/public-rate-utils';

type PricingBasis='room_night'|'unit_night'|'cabin_night'|'guest'|'package';
type P={
  id?:string;
  slug:string;
  type?:string;
  name:string;
  place:string;
  address:string;
  latitude?:number|string|null;
  longitude?:number|string|null;
  price:string;
  pricingBasis?:PricingBasis;
  summary:string;
  cover:string;
  gallery:string;
  rating:string;
  category:string;
  boarding:string;
  pickup?:string;
  duration:string;
  route?:string;
  amenities:string;
  amenityTags?:string[];
  amenityDetails?:Record<string,string>;
  policies:string;
  content:string;
  checkin?:string;
  checkout?:string;
  units:any[];
};

const lines=(v?:string)=>String(v||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
const fmt=(n:number)=>new Intl.NumberFormat('vi-VN').format(n)+'đ';

export function UnifiedCruisePublicDetail({product:p,initialRates=[]}:{product:P;initialRates?:PublicRateRange[]}){
  const visibleUnits=(p.units||[]).filter((u:any)=>u?.status!=='hidden');
  const ticketMode=p.pricingBasis==='guest'||p.pricingBasis==='package'||(
    visibleUnits.length>0&&visibleUnits.every((u:any)=>u?.pricingBasis==='guest'||u?.pricingBasis==='package')
  );
  const configuredPrices=visibleUnits.flatMap((u:any)=>allSeasonalPriceCandidates(u)).filter(Boolean);
  const price=configuredPrices.length
    ?`Từ ${fmt(Math.min(...configuredPrices))}`
    :ticketMode?(p.price||'Liên hệ'):'Liên hệ giá cabin';
  const legacy=lines(p.amenities);
  const tags=Array.isArray(p.amenityTags)&&p.amenityTags.length?p.amenityTags:inferAmenityTags('Du thuyền',p.amenities);
  const details=p.amenityDetails||{};
  const structured=amenityOptions('Du thuyền').filter(item=>tags.includes(item.id));
  const unitTab=ticketMode?'Vé / gói':'Cabin';
  const unitLabel=ticketMode?'Vé / gói dịch vụ & giá':'Danh sách cabin & giá';
  const calendarLabel=ticketMode?'Lịch giá vé / gói theo ngày':'Lịch giá cabin theo ngày';

  return <div className="product-detail-v2">
    <section className="pd-head"><div className="container">
      <div className="pd-breadcrumb"><Link href="/">Trang chủ</Link><span>›</span><Link href="/du-thuyen">Du thuyền</Link><span>›</span><b>{p.name}</b></div>
      <div className="pd-title"><div><span className="pd-type">Du thuyền</span><h1>{p.name}</h1><p>⚓ {p.boarding||p.place||p.address||'Đang cập nhật bến tàu'}</p></div></div>
    </div></section>
    <PublicServiceNav active="cruise"/>
    <ProductGallery title={p.name} cover={p.cover} gallery={p.gallery} kind="Du thuyền"/>

    <section className="container pd-summary-grid">
      <div className="pd-summary-card">
        <span className="sub-kicker">{p.category||(ticketMode?'Du thuyền trải nghiệm':'Du thuyền nghỉ dưỡng')}</span>
        <h2>{ticketMode?'Hành trình du thuyền & vé trải nghiệm':'Hành trình du thuyền & cabin riêng'}</h2>
        <p>{p.summary||'Thông tin hành trình đang được cập nhật.'}</p>
        {p.content&&<p className="cms-preline">{p.content}</p>}
        <div className="pd-quick-info">
          <span>{ticketMode?'✓ Vé / gói dịch vụ quản lý riêng':'✓ Cabin quản lý riêng'}</span>
          <span>{ticketMode?'✓ Giá theo ngày khởi hành':'✓ Giá cabin theo ngày thường / cuối tuần / lễ'}</span>
          {p.duration&&<span>✓ {p.duration}</span>}
          {p.route&&<span>✓ {p.route}</span>}
        </div>
        {structured.length?<div className="pd-amenity-icon-grid compact">{structured.slice(0,4).map(item=><div className="pd-amenity-icon-card" key={item.id}><span>{item.icon}</span><div><b>{item.label}</b>{details[item.id]?<small>{details[item.id]}</small>:null}</div></div>)}</div>:null}
      </div>
      <div className="pd-price-card">
        <small>{ticketMode?'GIÁ VÉ / GÓI TỪ':'GIÁ CABIN TỪ'}</small>
        <strong>{price}</strong>
        <p>{ticketMode?'Giá thay đổi theo ngày khởi hành, chương trình và số khách.':'Giá thay đổi theo cabin, ngày khởi hành và số khách.'}</p>
        <a href="#rate-calendar">Xem lịch giá</a>
        <a href="#booking">{ticketMode?'Kiểm tra giá & chỗ':'Kiểm tra giá & cabin'}</a>
      </div>
    </section>

    <nav className="pd-tabs"><div className="container">
      <a href="#overview">Tổng quan</a><a href="#location">Vị trí</a><a href="#units">{unitTab}</a><a href="#rate-calendar">Lịch giá</a><a href="#amenities">Tiện ích</a><a href="#policy">Chính sách</a><a href="#reviews">Đánh giá</a>
    </div></nav>

    <section className="container pd-body"><main>
      <section id="overview" className="pd-block"><h2>Tổng quan</h2><p>{p.summary||'Thông tin đang được cập nhật.'}</p>{p.route?<div className="pd-highlight-grid"><div>🧭 <b>{p.route}</b></div>{p.duration?<div>🗓 <b>{p.duration}</b></div>:null}</div>:null}</section>
      <ProductRateCalendar units={p.units||[]} label={calendarLabel} initialRates={initialRates} kind={ticketMode?'ticket':'cruise'}/>
      <Suspense fallback={<section className="detail-block"><h2>{ticketMode?'Đang tải vé / gói...':'Đang tải cabin...'}</h2></section>}>
        <PublishedUnits slug={p.slug} providedUnits={p.units||[]} label={unitLabel} initialRates={initialRates}/>
      </Suspense>
      <section id="amenities" className="pd-block"><h2>Tiện ích & dịch vụ</h2>{structured.length?<div className="pd-amenity-icon-grid">{structured.map(item=><div className="pd-amenity-icon-card" key={item.id}><span>{item.icon}</span><div><b>{item.label}</b>{details[item.id]?<small>{details[item.id]}</small>:null}</div></div>)}</div>:legacy.length?<div className="pd-highlight-grid">{legacy.map(item=><div key={item}>✦ <b>{item}</b></div>)}</div>:<p>Tiện ích được cập nhật theo từng hành trình.</p>}</section>
      <section id="policy" className="pd-block"><h2>Chính sách</h2><div className="pd-policy-grid">{!ticketMode&&(p.checkin||p.checkout)?<div><b>Nhận / trả cabin</b><p>{p.checkin||'14:00'} / {p.checkout||'12:00'}</p></div>:null}<div><b>Điều kiện hành trình</b><p className="cms-preline">{p.policies||(ticketMode?'Áp dụng theo hành trình, ngày khởi hành và gói dịch vụ.':'Áp dụng theo hành trình, cabin và gói giá.')}</p></div></div></section>
      <ProductLocationMap name={p.name} product={p}/>
      <CustomerReviews slug={p.slug} productName={p.name}/>
    </main><aside id="booking"><BookingInquiry product={p.name} productId={p.id} productSlug={p.slug} kind="du thuyền" mode={ticketMode?'ticket':'cabin'}/></aside></section>
  </div>;
}
