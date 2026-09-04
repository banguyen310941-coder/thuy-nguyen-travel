'use client';

import {useEffect,useMemo,useState} from 'react';
import {pricingDayKind,pricingMoney} from '@/lib/pricing-calendar';

export type RateStatus='available'|'hold'|'soldout';
export type RateSeason='low'|'regular'|'high'|'holiday'|'custom';
export type RateRange={
  id:string;
  unitId:string;
  start:string;
  end:string;
  price:string;
  oldPrice:string;
  quantity:string;
  minStay:string;
  status:RateStatus;
  note:string;
  season?:RateSeason;
  weekdayPrice?:string;
  weekendPrice?:string;
  sundayPrice?:string;
  holidayPrice?:string;
};

export const RATE_KEY='tn_cms_daily_rates_v1';
const read=():RateRange[]=>{try{const x=JSON.parse(localStorage.getItem(RATE_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
const uid=()=>`rate_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
const blank=(unitId:string):RateRange=>({id:'',unitId,start:'',end:'',price:'',oldPrice:'',quantity:'1',minStay:'1',status:'available',note:'',season:'regular',weekdayPrice:'',weekendPrice:'',sundayPrice:'',holidayPrice:''});
const seasonLabel=(season?:RateSeason)=>season==='low'?'Mùa thấp điểm':season==='high'?'Mùa cao điểm':season==='holiday'?'Lễ / Tết':season==='custom'?'Khoảng đặc biệt':'Mùa thường';
const fmt=(n:number)=>new Intl.NumberFormat('vi-VN').format(n)+'đ';

export function ratesForUnit(unitId:string){return read().filter(x=>x.unitId===unitId)}
export function rateForDate(unitId:string,date:string){const matches=ratesForUnit(unitId).filter(x=>x.start&&x.end&&date>=x.start&&date<=x.end);return matches.length?matches[matches.length-1]:null}
export function ratePriceCandidates(rate:RateRange){return [rate.weekdayPrice,rate.weekendPrice,rate.sundayPrice,rate.holidayPrice,rate.price].map(pricingMoney).filter(Boolean)}
export function ratePriceForDate(rate:RateRange,date:Date){
  const generic=pricingMoney(rate.price);
  const weekday=pricingMoney(rate.weekdayPrice);
  const weekend=pricingMoney(rate.weekendPrice);
  const sunday=pricingMoney(rate.sundayPrice);
  const holiday=pricingMoney(rate.holidayPrice);
  const dayKind=pricingDayKind(date);
  if(rate.season==='holiday'||dayKind==='holiday')return holiday||generic;
  const day=date.getDay();
  if(day===0)return sunday||weekday||generic;
  if(day===5||day===6)return weekend||generic;
  return weekday||generic;
}

export function AdminRateCalendar({unitId}:{unitId:string}){
  const [items,setItems]=useState<RateRange[]>([]);
  const [form,setForm]=useState<RateRange>(blank(unitId));
  const [msg,setMsg]=useState('');
  const load=()=>setItems(ratesForUnit(unitId));
  useEffect(()=>{load()},[unitId]);
  const sorted=useMemo(()=>[...items].sort((a,b)=>a.start.localeCompare(b.start)),[items]);

  function persist(nextForUnit:RateRange[]){
    try{
      const all=read().filter(x=>x.unitId!==unitId);
      localStorage.setItem(RATE_KEY,JSON.stringify([...all,...nextForUnit]));
      setItems(nextForUnit);
      window.dispatchEvent(new Event('tn-rates-updated'));
      return true;
    }catch{
      setMsg('Không lưu được lịch giá. Bộ nhớ trình duyệt có thể đã đầy.');
      return false;
    }
  }
  function save(){
    if(!form.start||!form.end){setMsg('Vui lòng chọn từ ngày và đến ngày.');return}
    if(form.end<form.start){setMsg('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.');return}
    const x={...form,id:form.id||uid(),unitId};
    const next=items.some(r=>r.id===x.id)?items.map(r=>r.id===x.id?x:r):[...items,x];
    if(persist(next)){
      setForm(blank(unitId));
      setMsg(ratePriceCandidates(x).length?'Đã lưu mùa và giá ghi đè cho khoảng ngày.':'Đã lưu khoảng mùa. Giá sẽ tự lấy từ bảng giá mùa của hạng phòng.');
    }
  }
  function edit(r:RateRange){setForm({...blank(unitId),...r});setMsg('')}
  function remove(id:string){if(!confirm('Xóa khoảng giá này?'))return;if(persist(items.filter(x=>x.id!==id))&&form.id===id)setForm(blank(unitId))}

  return <div className="rate-calendar-admin">
    <div className="rate-calendar-head"><div><b>📅 Khoảng mùa & lịch giá</b><small>Chọn khoảng ngày thuộc mùa thấp điểm, mùa thường, mùa cao điểm hoặc lễ/Tết. Hệ thống sẽ lấy giá trong tuần/cuối tuần từ bảng giá của hạng phòng. Các ô giá bên dưới chỉ dùng khi cần ghi đè riêng cho khoảng này.</small></div><span>{items.length} khoảng mùa</span></div>
    <div className="rate-season-flow"><span>1. Chọn khoảng ngày</span><b>→</b><span>2. Chọn mùa</span><b>→</b><span>3. Hệ thống lấy đúng giá trong tuần / cuối tuần</span></div>
    <div className="rate-calendar-form">
      <label>Từ ngày<input type="date" value={form.start} onChange={e=>setForm(f=>({...f,start:e.target.value,end:f.end&&f.end<e.target.value?e.target.value:f.end}))}/></label>
      <label>Đến ngày<input type="date" min={form.start||undefined} value={form.end} onChange={e=>setForm(f=>({...f,end:e.target.value}))}/></label>
      <label>Mùa / giai đoạn<select value={form.season||'regular'} onChange={e=>setForm(f=>({...f,season:e.target.value as RateSeason}))}><option value="low">Mùa thấp điểm</option><option value="regular">Mùa thường</option><option value="high">Mùa cao điểm</option><option value="holiday">Lễ / Tết</option><option value="custom">Khoảng đặc biệt</option></select></label>
      <label>Trạng thái<select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as RateStatus}))}><option value="available">Mở bán</option><option value="hold">Tạm giữ</option><option value="soldout">Hết phòng</option></select></label>
      <div className="rate-override-title"><b>Giá ghi đè riêng — không bắt buộc</b><small>Để trống toàn bộ nếu muốn dùng bảng giá mùa đã nhập ở hạng phòng.</small></div>
      <label>Giá chung ghi đè<input inputMode="numeric" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="Không bắt buộc"/></label>
      <label>Ghi đè trong tuần<input inputMode="numeric" value={form.weekdayPrice||''} onChange={e=>setForm(f=>({...f,weekdayPrice:e.target.value}))} placeholder="Không bắt buộc"/></label>
      <label>Ghi đè T6–T7<input inputMode="numeric" value={form.weekendPrice||''} onChange={e=>setForm(f=>({...f,weekendPrice:e.target.value}))} placeholder="Không bắt buộc"/></label>
      <label>Ghi đè Chủ nhật<input inputMode="numeric" value={form.sundayPrice||''} onChange={e=>setForm(f=>({...f,sundayPrice:e.target.value}))} placeholder="Không bắt buộc"/></label>
      <label>Ghi đè Lễ / Tết<input inputMode="numeric" value={form.holidayPrice||''} onChange={e=>setForm(f=>({...f,holidayPrice:e.target.value}))} placeholder="Không bắt buộc"/></label>
      <label>Giá gốc / giá gạch<input inputMode="numeric" value={form.oldPrice} onChange={e=>setForm(f=>({...f,oldPrice:e.target.value}))} placeholder="Không bắt buộc"/></label>
      <label>Số căn/phòng còn<input type="number" min="0" value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))}/></label>
      <label>Ở tối thiểu<input type="number" min="1" value={form.minStay} onChange={e=>setForm(f=>({...f,minStay:e.target.value}))}/></label>
      <label className="rate-note">Ghi chú<input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Ví dụ: cao điểm hè, thấp điểm sau Tết..."/></label>
      <div className="rate-form-actions"><button type="button" className="admin-primary" onClick={save}>{form.id?'Cập nhật khoảng mùa':'+ Thêm khoảng mùa'}</button>{form.id&&<button type="button" onClick={()=>setForm(blank(unitId))}>Hủy sửa</button>}</div>
    </div>
    {msg&&<small className="rate-message">{msg}</small>}
    {sorted.length>0&&<div className="rate-range-list">{sorted.map(r=>{
      const prices=ratePriceCandidates(r);
      const min=prices.length?Math.min(...prices):0;
      const max=prices.length?Math.max(...prices):0;
      return <article key={r.id}><div><b>{r.start} → {r.end}</b><small>{seasonLabel(r.season)} · {r.note||'Theo bảng giá mùa'}</small></div><strong>{r.status==='soldout'?'Hết phòng':r.status==='hold'?'Tạm giữ':min?(min===max?fmt(min):`${fmt(min)} – ${fmt(max)}`):'Dùng bảng giá mùa'}</strong><span>Còn {r.quantity||'0'} · tối thiểu {r.minStay||'1'} đêm</span><div><button type="button" onClick={()=>edit(r)}>Sửa</button><button type="button" className="danger-action" onClick={()=>remove(r.id)}>Xóa</button></div></article>
    })}</div>}
  </div>;
}
