'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { stays } from '@/data/catalog';

export function StayCatalog(){
  const params=useSearchParams();
  const q=(params.get('q')||'').toLowerCase();
  const typeParam=(params.get('type')||'').toLowerCase();
  const [type,setType]=useState(typeParam||'all');
  const [rating,setRating]=useState('all');

  useEffect(()=>{ setType(typeParam||'all'); },[typeParam]);

  const filtered=useMemo(()=>stays.filter(stay=>{
    const matchQ=!q||`${stay.name} ${stay.location} ${stay.summary}`.toLowerCase().includes(q);
    const t=stay.type.toLowerCase();
    const matchType=type==='all'||(type==='villa'&&t==='villa')||(type==='hotel'&&(t==='khách sạn'||t==='resort'))||(type==='resort'&&t==='resort');
    const matchRating=rating==='all'||stay.rating>=Number(rating);
    return matchQ&&matchType&&matchRating;
  }),[q,type,rating]);

  const checkin=params.get('checkin'); const checkout=params.get('checkout');
  const adults=params.get('adults')||'2'; const children=params.get('children')||'0'; const rooms=params.get('rooms')||'1';
  const label=typeParam==='villa'?'Villa & Resort':typeParam==='hotel'?'Khách sạn & Resort':typeParam==='resort'?'Resort':'Lưu trú toàn quốc';

  return <>
    <div className="search-summary"><div><b>{q?`${label}: kết quả cho “${params.get('q')}”`:label}</b><span>{checkin&&checkout?`${checkin} → ${checkout} · `:''}{adults} người lớn · {children} trẻ em · {rooms} phòng</span></div><Link href="/">Đổi tìm kiếm</Link></div>
    <div className="booking-layout">
      <aside className="booking-filter"><h3>Bộ lọc</h3><label>Loại chỗ nghỉ<select value={type} onChange={e=>setType(e.target.value)}><option value="all">Tất cả</option><option value="villa">Villa & Resort</option><option value="hotel">Khách sạn & Resort</option><option value="resort">Chỉ Resort</option></select></label><label>Điểm đánh giá<select value={rating} onChange={e=>setRating(e.target.value)}><option value="all">Tất cả</option><option value="9">9+ Tuyệt hảo</option><option value="8.5">8.5+ Rất tốt</option></select></label><label>Ngân sách<select defaultValue="all"><option value="all">Tất cả mức giá</option><option>Dưới 1.500.000đ</option><option>1.500.000đ – 3.000.000đ</option><option>Trên 3.000.000đ</option></select></label></aside>
      <div className="booking-results">{filtered.length?filtered.map(stay=><article className="booking-card" key={stay.slug}><img src={stay.image} alt={stay.name}/><div><span className="meta">{stay.type} · {stay.rating}/10</span><h3>{stay.name}</h3><p>📍 {stay.location}</p><p className="summary">{stay.summary}</p><Link className="view-link" href={`/stay/${stay.slug}`}>Xem tiện ích, phòng & chính sách →</Link></div><div className="booking-price"><small>Giá theo ngày</small><strong>Liên hệ giá tốt</strong><Link href={`/stay/${stay.slug}`}>Xem phòng</Link></div></article>):<div className="empty-results"><b>Chưa tìm thấy {label.toLowerCase()} phù hợp</b><p>Thử đổi điểm đến hoặc bộ lọc, hoặc gọi 0969 973 949 để chúng tôi tìm giúp.</p></div>}</div>
    </div>
  </>;
}
