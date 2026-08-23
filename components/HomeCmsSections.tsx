'use client';

import Link from 'next/link';
import { PropertyCard } from '@/components/PropertyCard';
import { cruises,destinations,stays,tours } from '@/data/catalog';
import { useHomeCms } from '@/components/HomeCmsHero';
import {useEffect,useMemo,useState} from 'react';

type CmsProduct={id:string;type:string;name:string;slug:string;place:string;price:string;status:string;summary:string;cover:string;rating:string;duration?:string};
type CmsTour={id:string;name:string;slug:string;category:string;duration:string;route:string;summary:string;status:string;salePrice?:string;gallery?:string};

const serviceCards=[
  ['✈','Tour du lịch','Tour trong nước & quốc tế','/tours'],
  ['🏡','Villa & Resort','Nghỉ dưỡng cao cấp','/stay?type=villa'],
  ['🏨','Khách sạn','Đặt phòng toàn quốc','/stay?type=hotel'],
  ['🛳','Du thuyền','Hải trình tuyệt vời','/cruises'],
  ['🧭','Điểm đến','Khám phá Việt Nam','/destinations'],
];

export function HomeCmsSections(){
  const cms=useHomeCms();
  const [cmsProducts,setCmsProducts]=useState<CmsProduct[]>([]);const [cmsTours,setCmsTours]=useState<CmsTour[]>([]);
  useEffect(()=>{try{setCmsProducts((JSON.parse(localStorage.getItem('tn_cms_products_v3_units')||'[]') as CmsProduct[]).filter(x=>x.status==='published'))}catch{}try{setCmsTours((JSON.parse(localStorage.getItem('tn_cms_tours_v3')||'[]') as CmsTour[]).filter(x=>x.status==='published'))}catch{}},[]);
  const staticStaySlugs=new Set(stays.map(x=>x.slug));const staticCruiseSlugs=new Set(cruises.map(x=>x.slug));const staticTourSlugs=new Set(tours.map(x=>x.slug));
  const newStays=useMemo(()=>cmsProducts.filter(x=>x.type!=='Du thuyền'&&!staticStaySlugs.has(x.slug)),[cmsProducts]);
  const newCruises=useMemo(()=>cmsProducts.filter(x=>x.type==='Du thuyền'&&!staticCruiseSlugs.has(x.slug)),[cmsProducts]);
  const newTours=useMemo(()=>cmsTours.filter(x=>!staticTourSlugs.has(x.slug)),[cmsTours]);
  const fallback='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85';
  return <>
    {cms.servicesEnabled&&<section className="mock-section mock-services-section"><div className="container"><div className="mock-section-heading center"><h2>{cms.servicesTitle}</h2><p>{cms.servicesSubtitle}</p></div><div className="mock-service-grid">{serviceCards.map(([icon,title,desc,href])=><Link href={href} className="mock-service-card" key={title}><span>{icon}</span><h3>{title}</h3><p>{desc}</p></Link>)}</div></div></section>}

    {cms.destinationsEnabled&&<section className="mock-section"><div className="container"><div className="mock-section-heading"><div><h2>{cms.destinationsTitle}</h2><div className="mock-pills"><Link className="active" href="/destinations">Trong nước</Link><Link href="/tours?category=china">Tour Trung Quốc</Link></div></div><Link href="/destinations">Xem tất cả →</Link></div><div className="mock-destination-grid">{destinations.slice(0,6).map(([name,meta,image])=><Link href={`/stay?q=${encodeURIComponent(name)}`} className="mock-destination-card" key={name}><div className="mock-destination-image" style={{backgroundImage:`linear-gradient(0deg,rgba(3,30,54,.72),rgba(3,30,54,0) 60%),url(${image})`}}><div><h3>{name}</h3><p>{meta}</p></div></div></Link>)}</div></div></section>}

    {cms.productsEnabled&&<section className="mock-section mock-soft"><div className="container"><div className="mock-section-heading"><div><h2>{cms.productsTitle}</h2><div className="mock-pills"><Link className="active" href="/stay">Tất cả lưu trú</Link><Link href="/stay?type=villa">Villa & Resort</Link><Link href="/stay?type=hotel">Khách sạn</Link><Link href="/cruises">Du thuyền</Link></div></div><Link href="/stay">Xem tất cả →</Link></div><div className="mock-product-grid">{newStays.slice(0,2).map(item=><article className="property-card cms-home-product" key={item.id}><Link className="property-image" href={`/product?slug=${encodeURIComponent(item.slug)}`} style={{backgroundImage:`url(${item.cover||fallback})`}}/><div className="property-body"><span className="property-type">{item.type}</span><h3>{item.name}</h3><p className="property-location">📍 {item.place||'Đang cập nhật'}</p><p className="property-summary">{item.summary||'Xem chi tiết sản phẩm và các hạng phòng/căn.'}</p><div className="property-footer"><span className="rating"><b>{item.rating||'Mới'}</b></span><span className="property-price">Từ {item.price||'Liên hệ'}</span></div></div></article>)}{stays.slice(0,Math.max(3,5-newStays.slice(0,2).length)).map(stay=><PropertyCard stay={stay} key={stay.slug}/>)}</div></div></section>}

    {cms.cruisesEnabled&&<section className="mock-section"><div className="container"><div className="mock-section-heading"><div><h2>{cms.cruisesTitle}</h2><p>{cms.cruisesSubtitle}</p></div><Link href="/cruises">Xem tất cả →</Link></div><div className="mock-tour-grid">{newCruises.slice(0,1).map(item=><Link href={`/product?slug=${encodeURIComponent(item.slug)}`} className="mock-tour-card" key={item.id}><div className="mock-tour-image" style={{backgroundImage:`url(${item.cover||fallback})`}}/><div><small>{item.duration||item.place||'Du thuyền'}</small><h3>{item.name}</h3><p>{item.summary||'Hải trình và cabin đang mở bán.'}</p>{item.price&&<b>Từ {item.price}</b>}</div></Link>)}{cruises.slice(0,newCruises.length?2:3).map(item=><Link href={`/cruises/${item.slug}`} className="mock-tour-card" key={item.slug}><div className="mock-tour-image" style={{backgroundImage:`url(${item.image})`}}/><div><small>{item.duration}</small><h3>{item.name}</h3><p>{item.summary}</p>{item.priceFrom&&<b>Từ {item.priceFrom}</b>}</div></Link>)}</div></div></section>}

    {cms.toursEnabled&&<section className="mock-section mock-soft"><div className="container"><div className="mock-section-heading"><div><h2>{cms.toursTitle}</h2><div className="mock-pills"><Link className="active" href="/tours">Tất cả tour</Link><Link href="/tours?category=china">Tour Trung Quốc</Link><Link href="/tours?category=domestic">Tour trong nước</Link></div></div><Link href="/tours">Xem tất cả →</Link></div><div className="mock-tour-grid">{newTours.slice(0,1).map(item=><Link href={`/tour-product?slug=${encodeURIComponent(item.slug)}`} className="mock-tour-card" key={item.id}><div className="mock-tour-image" style={{backgroundImage:`url(${(item.gallery||'').split(/\n+/).find(Boolean)||fallback})`}}/><div><small>{item.category} · {item.duration||'Đang cập nhật'}</small><h3>{item.name}</h3><p>{item.summary||item.route||'Tour mới từ hệ thống quản trị.'}</p>{item.salePrice&&<b>Từ {item.salePrice}</b>}</div></Link>)}{tours.slice(0,newTours.length?2:3).map(item=><Link href={`/tours/${item.slug}`} className="mock-tour-card" key={item.slug}><div className="mock-tour-image" style={{backgroundImage:`url(${item.image})`}}/><div><small>{item.category} · {item.duration}</small><h3>{item.name}</h3><p>{item.summary}</p></div></Link>)}</div></div></section>}

    {cms.ctaEnabled&&<section className="mock-section"><div className="container mock-cta-strip"><div><span>{cms.ctaEyebrow}</span><h2>{cms.ctaTitle}</h2><p>{cms.ctaText}</p></div><div><a href={`tel:${cms.hotline}`} className="mock-call-cta">☎ {cms.hotline.replace(/^(\d{4})(\d{3})(\d{3})$/,'$1 $2 $3')}</a><a href={`https://zalo.me/${cms.zalo}`} className="mock-zalo-cta">Zalo</a></div></div></section>}
  </>;
}
