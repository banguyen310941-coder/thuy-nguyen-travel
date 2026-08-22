'use client';

import Link from 'next/link';
import {useEffect,useState} from 'react';

type Article={id:string;title:string;slug:string;category:string;excerpt:string;cover:string;status:string;date:string};

export function GuideCmsList(){
 const [items,setItems]=useState<Article[]>([]);
 useEffect(()=>{try{const raw=JSON.parse(localStorage.getItem('tn_cms_articles_v3')||'[]') as Article[];setItems(raw.filter(x=>x.status==='published'&&x.title&&x.slug))}catch{}},[]);
 if(!items.length)return null;
 return <section className="cms-guide-section"><div className="sub-heading"><div><small>BÀI TỪ HỆ THỐNG QUẢN TRỊ</small><h2>Bài viết mới xuất bản</h2><p>Nội dung được đăng trực tiếp từ trang quản trị trên thiết bị này.</p></div></div><div className="guide-grid">{items.map(a=><article className="guide-card" key={a.id}><div className="guide-image" style={{backgroundImage:`url(${a.cover||'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85'})`}}/><div className="guide-body"><small>{a.category||'Cẩm nang du lịch'} · {a.date||''}</small><h3>{a.title}</h3><p>{a.excerpt||'Xem nội dung chi tiết và các kinh nghiệm du lịch hữu ích.'}</p><div className="guide-links"><Link href={`/guide/read?slug=${encodeURIComponent(a.slug)}`}>Đọc bài →</Link><a href="tel:0969973949">Hỏi tư vấn</a></div></div></article>)}</div></section>;
}
