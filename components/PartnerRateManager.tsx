'use client';

import {useEffect,useMemo,useState} from 'react';

export type PartnerPriceRule={date:string;agencyPrice:string;retailPrice:string;promoPrice:string;quantity:string;note:string};
export type PartnerPricing={productId:string;commission:string;agencyPrice:string;retailPrice:string;promoPrice:string;rules:PartnerPriceRule[];updatedAt:string};
export type PartnerRateProduct={id:string;name:string;status:string;price?:string};
export const PARTNER_PRICING_KEY='happygo_partner_pricing_v1';

const blank=(productId:string):PartnerPricing=>({productId,commission:'10',agencyPrice:'',retailPrice:'',promoPrice:'',rules:[],updatedAt:''});
function readAll():PartnerPricing[]{try{const raw=localStorage.getItem(PARTNER_PRICING_KEY);const v=raw?JSON.parse(raw):[];return Array.isArray(v)?v:[]}catch{return[]}}
function saveAll(v:PartnerPricing[]){try{localStorage.setItem(PARTNER_PRICING_KEY,JSON.stringify(v));window.dispatchEvent(new Event('happygo-partner-rates-updated'))}catch{}}
const money=(v:string)=>{const d=(v||'').replace(/\D/g,'');return d?Number(d):0};
const fmt=(v:string)=>{const n=money(v);return n?new Intl.NumberFormat('vi-VN').format(n)+'đ':'—'};

export function PartnerRateManager({products}:{products:PartnerRateProduct[]}){
 const[selected,setSelected]=useState('');const[all,setAll]=useState<PartnerPricing[]>([]);const[form,setForm]=useState<PartnerPricing>(blank(''));const[msg,setMsg]=useState('');
 useEffect(()=>{const list=readAll();setAll(list);if(products.length){const id=products[0].id;setSelected(id);setForm(list.find(x=>x.productId===id)||blank(id))}},[products]);
 const product=useMemo(()=>products.find(x=>x.id===selected),[products,selected]);
 function choose(id:string){setSelected(id);setForm(all.find(x=>x.productId===id)||blank(id));setMsg('')}
 function save(){if(!selected)return;const next={...form,productId:selected,updatedAt:new Date().toISOString()};const list=all.some(x=>x.productId===selected)?all.map(x=>x.productId===selected?next:x):[...all,next];setAll(list);setForm(next);saveAll(list);setMsg('Đã lưu cấu hình giá.')}
 function addRule(){const d=new Date();d.setDate(d.getDate()+1);setForm(s=>({...s,rules:[...s.rules,{date:d.toISOString().slice(0,10),agencyPrice:s.agencyPrice,retailPrice:s.retailPrice,promoPrice:s.promoPrice,quantity:'5',note:''}]}))}
 function updateRule(i:number,k:keyof PartnerPriceRule,v:string){setForm(s=>({...s,rules:s.rules.map((r,n)=>n===i?{...r,[k]:v}:r)}))}
 function removeRule(i:number){setForm(s=>({...s,rules:s.rules.filter((_,n)=>n!==i)}))}
 const commissionValue=Math.max(0,money(form.retailPrice)-money(form.agencyPrice));
 if(!products.length)return <section className="partner-panel"><div className="partner-empty"><b>Chưa có sản phẩm để thiết lập giá</b><p>Hãy tạo sản phẩm trước, sau đó quay lại mục Giá & tình trạng.</p></div></section>;
 return <section className="partner-panel partner-rate-manager"><div className="partner-panel-head"><div><h3>Giá, commission & tình trạng bán</h3><p>Giá đại lý là dữ liệu nội bộ. Giao diện khách chỉ sử dụng giá bán lẻ hoặc giá khuyến mại.</p></div><button className="partner-primary" type="button" onClick={save}>Lưu bảng giá</button></div>
 <div className="partner-rate-product"><label>Sản phẩm<select value={selected} onChange={e=>choose(e.target.value)}>{products.map(p=><option value={p.id} key={p.id}>{p.name} · {p.status==='approved'?'Đã duyệt':p.status==='review'?'Chờ duyệt':'Bản nháp'}</option>)}</select></label>{product&&<span className={`partner-status ${product.status}`}>{product.status==='approved'?'Đã duyệt & sẵn sàng bán':product.status==='review'?'Đang chờ HappyGo duyệt':'Bản nháp'}</span>}</div>
 <div className="partner-price-grid"><label><span>Commission HappyGo (%)</span><input value={form.commission} onChange={e=>setForm({...form,commission:e.target.value})} inputMode="decimal"/><small>Ví dụ 10% hoặc 15%</small></label><label className="agency"><span>Giá đại lý / giá net</span><input value={form.agencyPrice} onChange={e=>setForm({...form,agencyPrice:e.target.value})} placeholder="2.200.000"/><small>🔒 Nội bộ Partner + Admin, không public</small></label><label><span>Giá bán lẻ</span><input value={form.retailPrice} onChange={e=>setForm({...form,retailPrice:e.target.value})} placeholder="2.500.000"/><small>Giá chuẩn hiển thị cho khách</small></label><label className="promo"><span>Giá khuyến mại</span><input value={form.promoPrice} onChange={e=>setForm({...form,promoPrice:e.target.value})} placeholder="2.350.000"/><small>Nếu có, giá này ưu tiên hiển thị public</small></label></div>
 <div className="partner-price-summary"><span><small>Giá net nội bộ</small><b>{fmt(form.agencyPrice)}</b></span><span><small>Giá public hiện tại</small><b>{fmt(form.promoPrice||form.retailPrice)}</b></span><span><small>Chênh lệch retail - net</small><b>{commissionValue?new Intl.NumberFormat('vi-VN').format(commissionValue)+'đ':'—'}</b></span><span><small>Commission khai báo</small><b>{form.commission||'0'}%</b></span></div>
 <div className="partner-calendar-head"><div><h4>Thiết lập giá theo lịch</h4><p>Mỗi ngày có thể ghi đè 3 mức giá và số lượng phòng/căn còn bán.</p></div><button type="button" onClick={addRule}>+ Thêm ngày</button></div>
 <div className="partner-calendar-table"><div className="calendar-row head"><b>Ngày</b><b>Giá đại lý 🔒</b><b>Giá bán lẻ</b><b>Khuyến mại</b><b>Tồn</b><b>Ghi chú</b><b></b></div>{form.rules.length?form.rules.map((r,i)=><div className="calendar-row" key={`${r.date}_${i}`}><input type="date" value={r.date} onChange={e=>updateRule(i,'date',e.target.value)}/><input value={r.agencyPrice} onChange={e=>updateRule(i,'agencyPrice',e.target.value)}/><input value={r.retailPrice} onChange={e=>updateRule(i,'retailPrice',e.target.value)}/><input value={r.promoPrice} onChange={e=>updateRule(i,'promoPrice',e.target.value)}/><input value={r.quantity} onChange={e=>updateRule(i,'quantity',e.target.value)} inputMode="numeric"/><input value={r.note} onChange={e=>updateRule(i,'note',e.target.value)} placeholder="Cuối tuần / lễ..."/><button type="button" onClick={()=>removeRule(i)}>×</button></div>):<div className="partner-calendar-empty">Chưa thiết lập giá theo ngày. Hệ thống sẽ dùng giá mặc định phía trên.</div>}</div>{msg&&<div className="partner-message">{msg}</div>}
 </section>
}
