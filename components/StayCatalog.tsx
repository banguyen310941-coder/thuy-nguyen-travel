'use client';

import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {useEffect,useMemo,useState} from 'react';
import {stays} from '@/data/catalog';
import {formatPhone,useSiteSettings} from '@/components/useSiteSettings';
import {DailyPriceRange} from '@/components/DailyPriceRange';
import {SafeImage,travelFallback} from '@/components/SafeImage';

type CmsProduct={id:string;type:string;name:string;slug:string;place:string;price:string;status:string;summary:string;cover:string;rating:string;category:string;units?:unknown[]};
type DisplayStay=(typeof stays)[number]&{cmsPrice?:string};

export function StayCatalog(){
  const params=useSearchParams();
  const settings=useSiteSettings();
  const q=(params.get('q')||'').toLowerCase();
  const typeParam=(params.get('type')||'').toLowerCase();
  const [type,setType]=useState(typeParam||'all');
  const [rating,setRating]=useState('all');
  const [cms,setCms]=useState<CmsProduct[]>([]);
  useEffect(()=>setType(typeParam||'all'),[typeParam]);
  useEffect(()=>{const load=()=>{try{setCms(JSON.parse(localStorage.getItem('tn_cms_products_v3_units')||'[]') as CmsProduct[])}catch{setCms([])}};load();window.addEventListener('tn-products-updated',load);window.addEventListener('storage',load);return()=>{window.removeEventListener('tn-products-updated',load);window.removeEventListener('storage',load)}},[]);
  const stayCms=useMemo(()=>cms.filter(x=>x.type==='Villa & Resort'||x.type==='Khách sạn'),[cms]);
  const staticSlugs=useMemo(()=>new Set(stays.map(x=>x.slug)),[]);
  const merged=useMemo<DisplayStay[]>(()=>stays.flatMap(stay=>{const edit=stayCms.find(x=>x.slug===stay.slug);if(edit&&edit.status!=='published')return[];if(!edit)return [{...stay,cmsPrice:''}];const mappedType=edit.type==='Villa & Resort'?'Villa':edit.type==='Khách sạn'?'Khách sạn':stay.type;return [{...stay,name:edit.name||stay.name,location:edit.place||stay.location,summary:edit.summary||stay.summary,image:edit.cover||stay.image,rating:Number(String(edit.rating||stay.rating).replace(',','.'))||stay.rating,type:mappedType as typeof stay.type,cmsPrice:edit.price||''}]}),[stayCms]);
  const cmsOnly=useMemo(()=>stayCms.filter(x=>x.status==='published'&&x.slug&&!staticSlugs.has(x.slug)),[stayCms,staticSlugs]);
  const checkin=params.get('checkin');const checkout=params.get('checkout');const adults=params.get('adults')||'2';const children=params.get('children')||'0';const rooms=params.get('rooms')||'1';
  const label=typeParam==='villa'?'Villa & Resort':typeParam==='hotel'?'Khách sạn & Resort':typeParam==='resort'?'Resort':'Lưu trú toàn quốc';
  const matches=(item:{name:string;location:string;summary:string;type:string;rating:number})=>{const text=`${item.name} ${item.location} ${item.summary}`.toLowerCase();const normalizedType=item.type.toLowerCase();return(!q||text.includes(q))&&(type==='all'||(type==='villa'&&normalizedType.includes('villa'))||(type==='hotel'&&(normalizedType.includes('khách sạn')||normalizedType.includes('resort')))||(type==='resort'&&normalizedType.includes('resort')))&&(rating==='all'||item.rating>=Number(rating))};
  const filtered=useMemo(()=>merged.filter(matches),[merged,q,type,rating]);
  const cmsFiltered=useMemo(()=>cmsOnly.filter(p=>matches({name:p.name,location:p.place,summary:p.summary,type:p.type==='Villa & Resort'?'Villa':'Khách sạn',rating:Number(String(p.rating||'0').replace(',','.'))||0})),[cmsOnly,q,type,rating]);
  const total=filtered.length+cmsFiltered.length;
  return <><div className="search-summary"><div><b>{q?`${label}: kết quả cho “${params.get('q')}”`:label}</b><span>{checkin&&checkout?`${checkin} → ${checkout} · `:''}{adults} người lớn · {children} trẻ em · {rooms} phòng · {total} kết quả</span></div><Link href="/">Đổi tìm kiếm</Link></div><div className="booking-layout"><aside className="booking-filter"><h3>Bộ lọc</h3><label>Loại chỗ nghỉ<select value={type} onChange={e=>setType(e.target.value)}><option value="all">Tất cả</option><option value="villa">Villa</option><option value="hotel">Khách sạn & Resort</option><option value="resort">Chỉ Resort</option></select></label><label>Điểm đánh giá<select value={rating} onChange={e=>setRating(e.target.value)}><option value="all">Tất cả</option><option value="9">9+ Tuyệt hảo</option><option value="8.5">8.5+ Rất tốt</option></select></label><p className="booking-filter-note">Giá và tình trạng phòng ưu tiên dữ liệu Admin theo ngày khách chọn.</p></aside><div className="booking-results">{filtered.map(stay=><article className="booking-card" key={stay.slug}><SafeImage src={stay.image} fallback={travelFallback(stay.type)} alt={stay.name}/><div><span className="meta">{stay.type} · {stay.rating}/10</span><h3>{stay.name}</h3><p>📍 {stay.location}</p><p className="summary">{stay.summary}</p><Link className="view-link" href={`/stay/${stay.slug}`}>Xem tiện ích, phòng & chính sách →</Link></div><div className="booking-price"><DailyPriceRange slug={stay.slug} fallback={stay.cmsPrice||'Liên hệ giá tốt'} checkin={checkin} checkout={checkout}/><Link href={`/stay/${stay.slug}${checkin?`?checkin=${checkin}${checkout?`&checkout=${checkout}`:''}`:''}`}>Xem phòng</Link></div></article>)}{cmsFiltered.map(p=><article className="booking-card cms-public-card" key={p.id}><SafeImage src={p.cover} fallback={travelFallback(p.type)} alt={p.name}/><div><span className="meta">{p.type} · {p.rating?`${p.rating}/10`:'Mới từ CMS'}</span><h3>{p.name}</h3><p>📍 {p.place||'Đang cập nhật địa điểm'}</p><p className="summary">{p.summary||'Thông tin chi tiết đang được cập nhật từ hệ thống quản trị.'}</p><Link className="view-link" href={`/product?slug=${encodeURIComponent(p.slug)}`}>Xem căn/phòng, tiện ích & chính sách →</Link></div><div className="booking-price"><DailyPriceRange slug={p.slug} fallback={p.price||'Liên hệ giá tốt'} checkin={checkin} checkout={checkout}/><Link href={`/product?slug=${encodeURIComponent(p.slug)}${checkin?`&checkin=${checkin}${checkout?`&checkout=${checkout}`:''}`:''}`}>Xem chi tiết</Link></div></article>)}{!total&&<div className="empty-results"><b>Chưa tìm thấy {label.toLowerCase()} phù hợp</b><p>Thử đổi điểm đến hoặc bộ lọc, hoặc gọi {formatPhone(settings.hotline)} để chúng tôi tìm giúp.</p><a href={`tel:${settings.hotline.replace(/\D/g,'')}`}>☎ Gọi tư vấn ngay</a></div>}</div></div></>;
}
