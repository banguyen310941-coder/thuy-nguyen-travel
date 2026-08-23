'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect,useMemo,useState } from 'react';
import { tours } from '@/data/catalog';

type CmsTour={id:string;name:string;slug:string;category:string;duration:string;departure:string;route:string;summary:string;status:string;salePrice:string;price:string;departures:string;gallery:string;days?:unknown[]};

export function TourCatalog(){
  const params=useSearchParams();
  const q=(params.get('q')||'').toLowerCase();
  const departure=(params.get('departure')||'').toLowerCase();
  const date=params.get('date')||'';
  const selectedDay=date?date.split('-').reverse().slice(0,2).join('/'):'';
  const categoryParam=(params.get('category')||'all').toLowerCase();
  const initialCategory=['china','domestic'].includes(categoryParam)?categoryParam:'all';
  const [category,setCategory]=useState(initialCategory);
  const [cms,setCms]=useState<CmsTour[]>([]);
  useEffect(()=>{setCategory(['china','domestic'].includes(categoryParam)?categoryParam:'all')},[categoryParam]);
  useEffect(()=>{try{const raw=JSON.parse(localStorage.getItem('tn_cms_tours_v3')||'[]') as CmsTour[];const staticSlugs=new Set(tours.map(x=>x.slug));setCms(raw.filter(x=>x.status==='published'&&x.slug&&!staticSlugs.has(x.slug)))}catch{setCms([])}},[]);
  const categoryMatch=(cat:string)=>category==='all'||(category==='china'&&cat==='Tour Trung Quốc')||(category==='domestic'&&cat==='Tour trong nước');
  const dateMatch=(values:string[])=>!selectedDay||!values.length||values.some(d=>d.startsWith(selectedDay));
  const filtered=useMemo(()=>tours.filter(item=>{
    const matchQ=!q||`${item.name} ${item.route} ${item.category} ${item.summary}`.toLowerCase().includes(q);
    const matchDeparture=!departure||(item.departureFrom||'').toLowerCase().includes(departure);
    return matchQ&&matchDeparture&&categoryMatch(item.category)&&dateMatch(item.departureDates||[]);
  }),[q,departure,category,selectedDay]);
  const cmsFiltered=useMemo(()=>cms.filter(item=>{
    const matchQ=!q||`${item.name} ${item.route} ${item.category} ${item.summary}`.toLowerCase().includes(q);
    const matchDeparture=!departure||(item.departure||'').toLowerCase().includes(departure);
    const departureDates=(item.departures||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
    return matchQ&&matchDeparture&&categoryMatch(item.category)&&dateMatch(departureDates);
  }),[cms,q,departure,category,selectedDay]);
  const total=filtered.length+cmsFiltered.length;
  return <><div className="sub-toolbar"><div><b>{total} hành trình phù hợp</b><br/><span>{q?`Điểm đến/từ khóa: ${params.get('q')}`:'Tour gia đình · Tour đoàn · Tour ghép'}{departure?` · Khởi hành: ${params.get('departure')}`:''}{date?` · Ngày đi: ${date.split('-').reverse().join('/')}`:''}</span></div><div className="sub-filter-row"><button type="button" className={`sub-chip ${category==='all'?'active':''}`} onClick={()=>setCategory('all')}>Tất cả</button><button type="button" className={`sub-chip ${category==='china'?'active':''}`} onClick={()=>setCategory('china')}>Trung Quốc</button><button type="button" className={`sub-chip ${category==='domestic'?'active':''}`} onClick={()=>setCategory('domestic')}>Trong nước</button></div></div><div className="catalog-grid">{filtered.map(item=><article className="catalog-card" key={item.slug}><div className="catalog-image" style={{backgroundImage:`url(${item.image})`}}/><div className="catalog-body"><small>{item.category} · {item.duration}</small><h3>{item.name}</h3><p>📍 {item.route}</p><p>{item.summary}</p>{item.departureFrom&&<p><b>Khởi hành:</b> {item.departureFrom}</p>}{item.departureDates?.length&&<p><b>Lịch gần nhất:</b> {item.departureDates.slice(0,3).join(' · ')}</p>}<div className="catalog-actions"><Link className="main" href={`/tours/${item.slug}`}>Xem chi tiết</Link><a className="secondary" href="https://zalo.me/0969973949">Zalo →</a></div></div></article>)}{cmsFiltered.map(item=>{const dates=(item.departures||'').split(/\n+/).filter(Boolean);return <article className="catalog-card cms-public-card" key={item.id}><div className="catalog-image" style={{backgroundImage:`url(${(item.gallery||'').split(/\n+/).find(Boolean)||'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1000&q=85'})`}}/><div className="catalog-body"><small>{item.category} · {item.duration||'Đang cập nhật'}</small><h3>{item.name}</h3><p>📍 {item.route||'Lịch trình đang cập nhật'}</p><p>{item.summary||'Tour được xuất bản từ hệ thống quản trị.'}</p>{item.departure&&<p><b>Khởi hành:</b> {item.departure}</p>}{dates.length>0&&<p><b>Lịch gần nhất:</b> {dates.slice(0,3).join(' · ')}</p>}<p><b style={{color:'#f15a24'}}>Từ {item.salePrice||item.price||'Liên hệ'}</b></p><div className="catalog-actions"><Link className="main" href={`/tour-product?slug=${encodeURIComponent(item.slug)}`}>Xem chi tiết</Link><a className="secondary" href="https://zalo.me/0969973949">Zalo →</a></div></div></article>})}</div>{!total&&<div className="empty-results"><b>Chưa tìm thấy tour đúng ngày đã chọn</b><p>Thử đổi ngày khởi hành, điểm đến hoặc nhóm tour. Những tour chưa công bố lịch vẫn có thể liên hệ để kiểm tra thêm.</p></div>}</>
}
