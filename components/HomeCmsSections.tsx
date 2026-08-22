'use client';

import Link from 'next/link';
import { PropertyCard } from '@/components/PropertyCard';
import { cruises,destinations,stays,tours } from '@/data/catalog';
import { useHomeCms } from '@/components/HomeCmsHero';

const serviceCards=[
  ['✈','Tour du lịch','Tour trong nước & quốc tế','/tours'],
  ['🏡','Villa & Resort','Nghỉ dưỡng cao cấp','/stay?type=villa'],
  ['🏨','Khách sạn','Đặt phòng toàn quốc','/stay?type=hotel'],
  ['🛳','Du thuyền','Hải trình tuyệt vời','/cruises'],
  ['🎁','Combo ưu đãi','Giá tốt · Tiết kiệm','/stay'],
];

export function HomeCmsSections(){
  const cms=useHomeCms();
  return <>
    {cms.servicesEnabled&&<section className="mock-section mock-services-section"><div className="container"><div className="mock-section-heading center"><h2>{cms.servicesTitle}</h2><p>{cms.servicesSubtitle}</p></div><div className="mock-service-grid">{serviceCards.map(([icon,title,desc,href])=><Link href={href} className="mock-service-card" key={title}><span>{icon}</span><h3>{title}</h3><p>{desc}</p></Link>)}</div></div></section>}

    {cms.destinationsEnabled&&<section className="mock-section"><div className="container"><div className="mock-section-heading"><div><h2>{cms.destinationsTitle}</h2><div className="mock-pills"><span className="active">Trong nước</span><span>Quốc tế</span></div></div><Link href="/destinations">Xem tất cả →</Link></div><div className="mock-destination-grid">{destinations.slice(0,6).map(([name,meta,image])=><Link href={`/stay?q=${encodeURIComponent(name)}`} className="mock-destination-card" key={name}><div className="mock-destination-image" style={{backgroundImage:`linear-gradient(0deg,rgba(3,30,54,.72),rgba(3,30,54,0) 60%),url(${image})`}}><div><h3>{name}</h3><p>{meta}</p></div></div></Link>)}</div></div></section>}

    {cms.productsEnabled&&<section className="mock-section mock-soft"><div className="container"><div className="mock-section-heading"><div><h2>{cms.productsTitle}</h2><div className="mock-pills"><span className="active">Villa & Resort</span><span>Du thuyền</span><span>Khách sạn</span><span>Tour du lịch</span></div></div><Link href="/stay">Xem tất cả →</Link></div><div className="mock-product-grid">{stays.slice(0,5).map(stay=><PropertyCard stay={stay} key={stay.slug}/>)}</div></div></section>}

    {cms.cruisesEnabled&&<section className="mock-section"><div className="container"><div className="mock-section-heading"><div><h2>{cms.cruisesTitle}</h2><p>{cms.cruisesSubtitle}</p></div><Link href="/cruises">Xem tất cả →</Link></div><div className="mock-tour-grid">{cruises.slice(0,3).map(item=><Link href={`/cruises/${item.slug}`} className="mock-tour-card" key={item.slug}><div className="mock-tour-image" style={{backgroundImage:`url(${item.image})`}}/><div><small>{item.duration}</small><h3>{item.name}</h3><p>{item.summary}</p>{item.priceFrom&&<b>Từ {item.priceFrom}</b>}</div></Link>)}</div></div></section>}

    {cms.toursEnabled&&<section className="mock-section mock-soft"><div className="container"><div className="mock-section-heading"><div><h2>{cms.toursTitle}</h2><div className="mock-pills"><span className="active">Tour Trung Quốc</span><span>Tour trong nước</span></div></div><Link href="/tours">Xem tất cả →</Link></div><div className="mock-tour-grid">{tours.slice(0,3).map(item=><Link href={`/tours/${item.slug}`} className="mock-tour-card" key={item.slug}><div className="mock-tour-image" style={{backgroundImage:`url(${item.image})`}}/><div><small>{item.category} · {item.duration}</small><h3>{item.name}</h3><p>{item.summary}</p></div></Link>)}</div></div></section>}

    {cms.ctaEnabled&&<section className="mock-section"><div className="container mock-cta-strip"><div><span>{cms.ctaEyebrow}</span><h2>{cms.ctaTitle}</h2><p>{cms.ctaText}</p></div><div><a href={`tel:${cms.hotline}`} className="mock-call-cta">☎ {cms.hotline.replace(/^(\d{4})(\d{3})(\d{3})$/,'$1 $2 $3')}</a><a href={`https://zalo.me/${cms.zalo}`} className="mock-zalo-cta">Zalo</a></div></div></section>}
  </>;
}
