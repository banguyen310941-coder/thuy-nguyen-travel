'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { stays } from '@/data/catalog';
import {formatPhone,useSiteSettings} from '@/components/useSiteSettings';

type CmsProduct={id:string;type:string;name:string;slug:string;place:string;price:string;status:string;summary:string;cover:string;rating:string;category:string;units?:unknown[]};

export function StayCatalog(){
  const params=useSearchParams();
  const settings=useSiteSettings();
  const q=(params.get('q')||'').toLowerCase();
  const typeParam=(params.get('type')||'').toLowerCase();
  const [type,setType]=useState(typeParam||'all');
  const [rating,setRating]=useState('all');
  const [cms,setCms]=useState<CmsProduct[]>([]);

  useEffect(()=>{ setType(typeParam||'all'); },[typeParam]);
  useEffect(()=>{
    const load=()=>{try{const raw=JSON.parse(localStorage.getItem('tn_cms_products_v3_units')||'[]') as CmsProduct[];const staticSlugs=new Set(stays.map(x=>x.slug));setCms(raw.filter(x=>x.status==='published'&&x.slug&&!staticSlugs.has(x.slug)&&(x.type==='Villa & Resort'||x.type==='Khách sạn')))}catch{setCms([])}};
    load();window.addEventListener('tn-products-updated',load);return()=>window.removeEventListener('tn-products-updated',load)
  },[]);

  const filtered=useMemo(()=>stays.filter(stay=>{
    const matchQ=!q||`${stay.name} ${stay.location} ${stay.summary}`.toLowerCase().includes(q);
    const t=stay.type.toLowerCase();
    const matchType=type==='all'||(type==='villa'&&t==='villa')||(type==='hotel'&&(t==='khách sạn'||t==='resort'))||(type==='resort'&&t==='resort');
    const matchRating=rating==='all'||stay.rating>=Number(rating);
    return matchQ&&matchType&&matchRating;
  }),[q,type,rating]);

  const cmsFiltered=useMemo(()=>cms.filter(p=>{
    const text=`${p.name} ${p.place} ${p.summary} ${p.category}`.toLowerCase();
    const matchQ=!q||text.includes(q);
    const matchType=type==='all'||(type==='villa'&&p.type==='Villa & Resort')||(type==='hotel'&&p.type==='Khách sạn')||(type==='resort'&&p.type==='Khách sạn'&&`${p.category} ${p.name}`.toLowerCase().includes('resort'));
    const score=Number(String(p.rating||'0').replace(',','.'))||0;
    const matchRating=rating==='all'||score>=Number(rating);
    return matchQ&&matchType&&matchRating;
  }),[cms,q,type,rating]);

  const checkin=params.get('checkin'); const checkout=params.get('checkout');
  const adults=params.get('adults')||'2'; const children=params.get('children')||'0'; const rooms=params.get('rooms')||'1';
  const label=typeParam==='villa'?'Villa & Resort':typeParam==='hotel'?'Khách sạn & Resort':typeParam==='resort'?'Resort':'Lưu trú toàn quốc';
  const total=filtered.length+cmsFiltered.length;

  return <>
    <div className="search-summary"><div><b>{q?`${label}: kết quả cho “${params.get('q')}”`:label}</b><span>{checkin&&checkout?`${checkin} → ${checkout} · `:''}{adults} người lớn · {children} trẻ em · {rooms} phòng · {total} kết quả</span></div><Link href="/">Đổi tìm kiếm</Link></div>
    <div className="booking-layout">
      <aside className="booking-filter"><h3>Bộ lọc</h3><label>Loại chỗ nghỉ<select value={type} onChange={e=>setType(e.target.value)}><option value="all">Tất cả</option><option value="villa">Villa</option><option value="hotel">Khách sạn & Resort</option><option value="resort">Chỉ Resort</option></select></label><label>Điểm đánh giá<select value={rating} onChange={e=>setRating(e.target.value)}><option value="all">Tất cả</option><option value="9">9+ Tuyệt hảo</option><option value="8.5">8.5+ Rất tốt</option></select></label><p className="booking-filter-note">Giá thực tế thay đổi theo ngày ở và từng căn/phòng. Các sản phẩm đã xuất bản từ CMS cũng xuất hiện trong danh sách này.</p></aside>
      <div className="booking-results">
        {filtered.map(stay=><article className="booking-card" key={stay.slug}><img src={stay.image} alt={stay.name}/><div><span className="meta">{stay.type} · {stay.rating}/10</span><h3>{stay.name}</h3><p>📍 {stay.location}</p><p className="summary">{stay.summary}</p><Link className="view-link" href={`/stay/${stay.slug}`}>Xem tiện ích, phòng & chính sách →</Link></div><div className="booking-price"><small>Giá theo ngày</small><strong>Liên hệ giá tốt</strong><Link href={`/stay/${stay.slug}`}>Xem phòng</Link></div></article>)}
        {cmsFiltered.map(p=><article className="booking-card cms-public-card" key={p.id}><img src={p.cover||'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80'} alt={p.name}/><div><span className="meta">{p.type} · {p.rating?`${p.rating}/10`:'Mới từ CMS'}</span><h3>{p.name}</h3><p>📍 {p.place||'Đang cập nhật địa điểm'}</p><p className="summary">{p.summary||'Thông tin chi tiết đang được cập nhật từ hệ thống quản trị.'}</p><Link className="view-link" href={`/product?slug=${encodeURIComponent(p.slug)}`}>Xem căn/phòng, tiện ích & chính sách →</Link></div><div className="booking-price"><small>Giá từ</small><strong>{p.price||'Liên hệ giá tốt'}</strong><Link href={`/product?slug=${encodeURIComponent(p.slug)}`}>Xem chi tiết</Link></div></article>)}
        {!total&&<div className="empty-results"><b>Chưa tìm thấy {label.toLowerCase()} phù hợp</b><p>Thử đổi điểm đến hoặc bộ lọc, hoặc gọi {formatPhone(settings.hotline)} để chúng tôi tìm giúp.</p><a href={`tel:${settings.hotline.replace(/\D/g,'')}`}>☎ Gọi tư vấn ngay</a></div>}
      </div>
    </div>
  </>;
}
