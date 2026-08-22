'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect,useMemo,useState } from 'react';
import { tours } from '@/data/catalog';

export function TourCatalog(){
  const params=useSearchParams();
  const q=(params.get('q')||'').toLowerCase();
  const departure=(params.get('departure')||'').toLowerCase();
  const date=params.get('date')||'';
  const selectedDay=date?date.split('-').reverse().slice(0,2).join('/'):'';
  const categoryParam=(params.get('category')||'all').toLowerCase();
  const initialCategory=['china','domestic'].includes(categoryParam)?categoryParam:'all';
  const [category,setCategory]=useState(initialCategory);
  useEffect(()=>{setCategory(['china','domestic'].includes(categoryParam)?categoryParam:'all')},[categoryParam]);
  const filtered=useMemo(()=>tours.filter(item=>{
    const matchQ=!q||`${item.name} ${item.route} ${item.category} ${item.summary}`.toLowerCase().includes(q);
    const matchDeparture=!departure||(item.departureFrom||'').toLowerCase().includes(departure);
    const matchCategory=category==='all'||(category==='china'&&item.category==='Tour Trung Quốc')||(category==='domestic'&&item.category==='Tour trong nước');
    const matchDate=!selectedDay||!item.departureDates?.length||item.departureDates.some(d=>d.startsWith(selectedDay));
    return matchQ&&matchDeparture&&matchCategory&&matchDate;
  }),[q,departure,category,selectedDay]);
  return <><div className="sub-toolbar"><div><b>{filtered.length} hành trình phù hợp</b><br/><span>{q?`Điểm đến/từ khóa: ${params.get('q')}`:'Tour gia đình · Tour đoàn · Tour ghép'}{departure?` · Khởi hành: ${params.get('departure')}`:''}{date?` · Ngày đi: ${date.split('-').reverse().join('/')}`:''}</span></div><div className="sub-filter-row"><button type="button" className={`sub-chip ${category==='all'?'active':''}`} onClick={()=>setCategory('all')}>Tất cả</button><button type="button" className={`sub-chip ${category==='china'?'active':''}`} onClick={()=>setCategory('china')}>Trung Quốc</button><button type="button" className={`sub-chip ${category==='domestic'?'active':''}`} onClick={()=>setCategory('domestic')}>Trong nước</button></div></div><div className="catalog-grid">{filtered.map(item=><article className="catalog-card" key={item.slug}><div className="catalog-image" style={{backgroundImage:`url(${item.image})`}}/><div className="catalog-body"><small>{item.category} · {item.duration}</small><h3>{item.name}</h3><p>📍 {item.route}</p><p>{item.summary}</p>{item.departureFrom&&<p><b>Khởi hành:</b> {item.departureFrom}</p>}{item.departureDates?.length&&<p><b>Lịch gần nhất:</b> {item.departureDates.slice(0,3).join(' · ')}</p>}<div className="catalog-actions"><Link className="main" href={`/tours/${item.slug}`}>Xem chi tiết</Link><a className="secondary" href="https://zalo.me/0969973949">Zalo →</a></div></div></article>)}</div>{!filtered.length&&<div className="empty-results"><b>Chưa tìm thấy tour đúng ngày đã chọn</b><p>Thử đổi ngày khởi hành, điểm đến hoặc nhóm tour. Những tour chưa công bố lịch vẫn có thể liên hệ để kiểm tra thêm.</p></div>}</>
}
