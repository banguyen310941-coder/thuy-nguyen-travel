'use client';

import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {cruises,stays,tours} from '@/data/catalog';

export function GlobalSearchResults(){
  const params=useSearchParams();
  const raw=(params.get('q')||'').trim();
  const q=raw.toLowerCase();
  const adults=params.get('adults')||'2';
  const children=params.get('children')||'0';
  const match=(text:string)=>!q||text.toLowerCase().includes(q);
  const stayResults=stays.filter(x=>match(`${x.name} ${x.location} ${x.type} ${x.summary}`));
  const tourResults=tours.filter(x=>match(`${x.name} ${x.route} ${x.category} ${x.summary}`));
  const cruiseResults=cruises.filter(x=>match(`${x.name} ${x.bay} ${x.duration} ${x.summary}`));
  const total=stayResults.length+tourResults.length+cruiseResults.length;

  return <div className="global-search-results">
    <div className="search-summary"><div><b>{raw?`${total} kết quả cho “${raw}”`:`${total} dịch vụ đang có`}</b><span>{adults} người lớn · {children} trẻ em · Tour, lưu trú và du thuyền</span></div><Link href="/">Đổi tìm kiếm</Link></div>

    {tourResults.length>0&&<section className="global-result-section"><div className="section-heading"><div><small>TOUR DU LỊCH</small><h2>Tour phù hợp</h2></div><Link href={`/tours${raw?`?q=${encodeURIComponent(raw)}`:''}`}>Xem tất cả →</Link></div><div className="catalog-grid">{tourResults.slice(0,4).map(item=><article className="catalog-card" key={item.slug}><div className="catalog-image" style={{backgroundImage:`url(${item.image})`}}/><div className="catalog-body"><small>{item.category} · {item.duration}</small><h3>{item.name}</h3><p>📍 {item.route}</p><div className="catalog-actions"><Link className="main" href={`/tours/${item.slug}`}>Xem tour</Link></div></div></article>)}</div></section>}

    {stayResults.length>0&&<section className="global-result-section"><div className="section-heading"><div><small>LƯU TRÚ</small><h2>Villa, Resort & Khách sạn</h2></div><Link href={`/stay${raw?`?q=${encodeURIComponent(raw)}`:''}`}>Xem tất cả →</Link></div><div className="catalog-grid">{stayResults.slice(0,4).map(item=><article className="catalog-card" key={item.slug}><div className="catalog-image" style={{backgroundImage:`url(${item.image})`}}/><div className="catalog-body"><small>{item.type} · {item.rating}/10</small><h3>{item.name}</h3><p>📍 {item.location}</p><div className="catalog-actions"><Link className="main" href={`/stay/${item.slug}`}>Xem phòng</Link></div></div></article>)}</div></section>}

    {cruiseResults.length>0&&<section className="global-result-section"><div className="section-heading"><div><small>DU THUYỀN</small><h2>Hành trình trên vịnh</h2></div><Link href={`/cruises${raw?`?q=${encodeURIComponent(raw)}`:''}`}>Xem tất cả →</Link></div><div className="catalog-grid">{cruiseResults.slice(0,4).map(item=><article className="catalog-card" key={item.slug}><div className="catalog-image" style={{backgroundImage:`url(${item.image})`}}/><div className="catalog-body"><small>{item.bay} · {item.duration}</small><h3>{item.name}</h3><p>{item.summary}</p><div className="catalog-actions"><Link className="main" href={`/cruises/${item.slug}`}>Xem du thuyền</Link></div></div></article>)}</div></section>}

    {total===0&&<div className="empty-results"><b>Chưa có dịch vụ phù hợp</b><p>Hãy thử tên địa điểm khác hoặc gọi 0969 973 949 để được tìm giúp.</p></div>}
  </div>;
}
