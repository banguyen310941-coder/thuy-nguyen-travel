'use client';

import {useEffect,useMemo,useState} from 'react';
import {addCartItem} from '@/components/BookingCart';
import {PARTNER_PRICING_KEY,type PartnerPricing} from '@/components/PartnerRateManager';

type PartnerProduct={id:string;partnerId:string;partnerName:string;type:string;name:string;place:string;summary:string;cover:string;status:string;updatedAt:string};
const PRODUCTS='happygo_partner_products_v1';
function read<T>(key:string,fallback:T):T{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw) as T:fallback}catch{return fallback}}
const money=(v:string)=>{const d=(v||'').replace(/\D/g,'');return d?Number(d):0};
const fmt=(n:number)=>new Intl.NumberFormat('vi-VN').format(n)+'đ';

export function ApprovedPartnerProducts(){
 const[products,setProducts]=useState<PartnerProduct[]>([]);const[pricing,setPricing]=useState<PartnerPricing[]>([]);const[added,setAdded]=useState('');
 useEffect(()=>{const load=()=>{const p=read<PartnerProduct[]>(PRODUCTS,[]);const r=read<PartnerPricing[]>(PARTNER_PRICING_KEY,[]);setProducts(Array.isArray(p)?p.filter(x=>x.status==='approved'):[]);setPricing(Array.isArray(r)?r:[])};load();window.addEventListener('storage',load);window.addEventListener('happygo-partner-rates-updated',load);window.addEventListener('happygo-partner-products-updated',load);return()=>{window.removeEventListener('storage',load);window.removeEventListener('happygo-partner-rates-updated',load);window.removeEventListener('happygo-partner-products-updated',load)}},[]);
 const items=useMemo(()=>products.map(p=>{const rate=pricing.find(r=>r.productId===p.id);const dated=(rate?.rules||[]).filter(x=>Number(x.quantity||0)>0).map(x=>money(x.promoPrice)||money(x.retailPrice)).filter(Boolean);const base=money(rate?.promoPrice||'')||money(rate?.retailPrice||'');const display=dated.length?Math.min(...dated):base;const retail=money(rate?.retailPrice||'');return{...p,display,retail,promo:Boolean(rate?.promoPrice)||dated.some(x=>x<retail)}}),[products,pricing]);
 function book(p:(typeof items)[number]){addCartItem({kind:p.type,product:p.name,adults:2,children:0,rooms:1,priceLabel:p.display?`${fmt(p.display)}/đêm`:'Liên hệ'});setAdded(p.id);setTimeout(()=>setAdded(''),1600)}
 if(!items.length)return null;
 return <section className="approved-partner-products"><div className="container"><div className="approved-partner-head"><div><span>ĐỐI TÁC ĐÃ ĐƯỢC HAPPYGO DUYỆT</span><h2>Sản phẩm mới đang mở bán</h2><p>Giá hiển thị là giá bán cho khách. Giá hợp đồng/đại lý được bảo mật và không xuất hiện tại đây.</p></div></div><div className="approved-partner-grid">{items.map(p=><article key={p.id}>{p.cover?<img src={p.cover} alt={p.name}/>:<div className="approved-partner-placeholder">{p.type.includes('Khách')?'🏨':p.type.includes('thuyền')?'🛳':p.type.includes('Tour')?'✈️':'🏝️'}</div>}<div className="approved-partner-body"><small>{p.type} · {p.place||'Việt Nam'}</small><h3>{p.name}</h3><p>{p.summary||`Sản phẩm do ${p.partnerName||'đối tác HappyGo'} cung cấp và đã được duyệt.`}</p><div className="approved-partner-price"><span><small>{p.promo?'GIÁ KHUYẾN MẠI':'GIÁ BÁN'}</small><b>{p.display?`Từ ${fmt(p.display)}`:'Liên hệ'}</b>{p.promo&&p.retail>p.display&&<del>{fmt(p.retail)}</del>}</span><button type="button" onClick={()=>book(p)}>{added===p.id?'✓ Đã thêm':'Đặt ngay'}</button></div></div></article>)}</div></div></section>
}
