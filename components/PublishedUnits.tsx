'use client';

import {useEffect,useMemo,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {rateForDate,ratesForUnit} from '@/components/AdminRateCalendar';

type Unit={id:string;code:string;name:string;bedrooms?:string;beds?:string;capacity:string;area:string;view:string;meal:string;weekdayPrice:string;weekendPrice:string;holidayPrice:string;extraAdult?:string;extraChild?:string;status:string;images?:string;amenities?:string};
type Product={slug:string;units?:Unit[]};
const money=(v:string)=>{const d=(v||'').replace(/\D/g,'');return d?Number(d):0};
const fmt=(n:number)=>new Intl.NumberFormat('vi-VN').format(n)+'đ';
const key=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const holiday=new Set(['01-01','04-30','05-01','09-02']);
const kind=(d:Date)=>holiday.has(`${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)?'holiday':(d.getDay()===5||d.getDay()===6)?'weekend':'weekday';
const fallback=(u:Unit,d:Date)=>{const w=money(u.weekdayPrice),we=money(u.weekendPrice)||w,h=money(u.holidayPrice)||we||w;return kind(d)==='holiday'?h:kind(d)==='weekend'?we:w};

export function PublishedUnits({slug,label='Căn / hạng phòng'}:{slug:string;label?:string}){
 const params=useSearchParams();const checkin=params.get('checkin');const checkout=params.get('checkout');
 const[units,setUnits]=useState<Unit[]>([]);const[rev,setRev]=useState(0);
 useEffect(()=>{const load=()=>{try{const raw=localStorage.getItem('tn_cms_products_v3_units');if(!raw){setUnits([]);return}const products:Product[]=JSON.parse(raw);setUnits((products.find(p=>p.slug===slug)?.units||[]).filter(u=>u.status!=='hidden'))}catch{setUnits([])}};const refresh=()=>{load();setRev(x=>x+1)};load();window.addEventListener('tn-products-updated',refresh);window.addEventListener('tn-rates-updated',refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener('tn-products-updated',refresh);window.removeEventListener('tn-rates-updated',refresh);window.removeEventListener('storage',refresh)}},[slug]);
 const selectedDates=useMemo(()=>{if(!checkin)return[];const s=new Date(`${checkin}T12:00:00`),e=checkout?new Date(`${checkout}T12:00:00`):new Date(s.getFullYear(),s.getMonth(),s.getDate()+1);const a:Date[]=[];for(let d=s;d<e&&a.length<31;d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1))a.push(d);return a},[checkin,checkout]);
 const choose=(u:Unit)=>window.dispatchEvent(new CustomEvent('tn:select-unit',{detail:{code:u.code,name:u.name}}));
 if(!units.length)return null;
 return <section className="detail-block live-units" id="units"><div className="live-units-head"><h2>{label} đang quản lý</h2><p>{checkin?`Giá và tồn phòng đã tính theo ${selectedDates.length} đêm đã chọn.`:'Giá bạn đã cấu hình trong Admin được hiển thị trực tiếp bên dưới. Chọn ngày để xem giá chính xác theo lịch.'}</p></div><div className="live-unit-list">{units.map(u=>{
  const photos=(u.images||'').split(/\n+/).map(x=>x.trim()).filter(Boolean).slice(0,4);
  const calendarRates=ratesForUnit(u.id).filter(r=>r.status==='available'&&Number(r.quantity||0)>0&&money(r.price)>0);
  const calendarPrices=calendarRates.map(r=>money(r.price)).filter(Boolean);
  const calendarMin=calendarPrices.length?Math.min(...calendarPrices):0;
  const calendarMax=calendarPrices.length?Math.max(...calendarPrices):0;
  const dayInfo=selectedDates.map(d=>{const r=rateForDate(u.id,key(d));return {date:d,rate:r,price:r&&r.status==='available'&&Number(r.quantity||0)>0?money(r.price):r?0:fallback(u,d)}});
  const vals=dayInfo.map(x=>x.price).filter(Boolean);const min=vals.length?Math.min(...vals):0,max=vals.length?Math.max(...vals):0;
  const custom=dayInfo.map(x=>x.rate).filter(Boolean);const soldByCalendar=custom.some(r=>r!.status!=='available'||Number(r!.quantity||0)<=0);const minQty=custom.length?Math.min(...custom.map(r=>Number(r!.quantity||0))):null;const minStay=custom.length?Math.max(...custom.map(r=>Number(r!.minStay||1))):1;const oldVals=custom.map(r=>money(r!.oldPrice)).filter(Boolean);const oldPrice=oldVals.length?Math.max(...oldVals):0;const stayOk=!selectedDates.length||selectedDates.length>=minStay;const available=u.status==='available'&&!soldByCalendar&&stayOk;
  const basePrices=[money(u.weekdayPrice),money(u.weekendPrice),money(u.holidayPrice)].filter(Boolean);const baseMin=basePrices.length?Math.min(...basePrices):0;const publicMin=calendarMin||baseMin;
  return <article key={`${u.id}_${rev}`}><div className="live-unit-main"><div><b>{u.name||'Chưa đặt tên'}</b><small>{u.code||'Chưa có mã'}{u.bedrooms?` · ${u.bedrooms} phòng ngủ`:''}{u.beds?` · ${u.beds}`:''}{u.capacity?` · ${u.capacity}`:' · Sức chứa liên hệ'}{u.area?` · ${u.area}`:''}{u.view?` · ${u.view}`:''}</small>{u.meal&&<span>{u.meal}</span>}{u.amenities&&<span>{u.amenities}</span>}{selectedDates.length&&minQty!==null&&<span className="availability-note">Chỉ còn {minQty} căn/phòng cho ngày đã chọn</span>}</div>{photos.length>0&&<div className="live-unit-gallery">{photos.map((src,i)=><a key={`${u.id}_${i}`} href={src} target="_blank" rel="noreferrer"><img src={src} alt={`${u.name||'Căn/phòng'} ${i+1}`}/></a>)}</div>}</div>
  {selectedDates.length?<div className="selected-date-price">{oldPrice>max&&<del>{fmt(oldPrice)}</del>}<small>Giá cho ngày đã chọn</small><b>{min?min===max?fmt(min):`${fmt(min)} – ${fmt(max)}`:'Không còn phòng'}</b><em>/ đêm · {selectedDates.length} đêm{minStay>1?` · tối thiểu ${minStay} đêm`:''}</em>{u.extraAdult&&<span>Phụ thu người lớn: <b>{u.extraAdult}</b></span>}{u.extraChild&&<span>Phụ thu trẻ em: <b>{u.extraChild}</b></span>}</div>:<><div className="selected-date-price"><small>GIÁ ĐANG MỞ BÁN</small><b>{publicMin?`Từ ${fmt(publicMin)}`:'Liên hệ'}</b>{calendarMin>0&&<em>{calendarMin===calendarMax?'Giá theo lịch đã cấu hình':`${fmt(calendarMin)} – ${fmt(calendarMax)} theo lịch`}</em>}</div><div className="live-unit-prices"><span><small>Ngày thường</small><b>{u.weekdayPrice||'Theo lịch'}</b></span><span><small>Cuối tuần</small><b>{u.weekendPrice||u.weekdayPrice||'Theo lịch'}</b></span><span><small>Lễ/Tết</small><b>{u.holidayPrice||'Theo lịch'}</b></span>{u.extraAdult&&<span><small>Phụ thu người lớn</small><b>{u.extraAdult}</b></span>}{u.extraChild&&<span><small>Phụ thu trẻ em</small><b>{u.extraChild}</b></span>}</div></>}
  <em className={`unit-public-status ${available?'available':'soldout'}`}>{available?'Còn bán':!stayOk?`Tối thiểu ${minStay} đêm`:'Hết / tạm giữ'}</em>{available?<a href="#booking" onClick={()=>choose(u)}>Đặt căn này</a>:<span className="unit-unavailable">Chưa thể đặt</span>}</article>})}</div></section>;
}
