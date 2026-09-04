'use client';

import {useEffect,useMemo,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {rateForDate,ratePriceForDate,ratesForUnit} from '@/components/AdminRateCalendar';
import {readPartnerPublic} from '@/components/PartnerPublicCatalog';
import {UnitPhotoGallery} from '@/components/UnitPhotoGallery';
import {pricingDateKey,pricingMoney} from '@/lib/pricing-calendar';

type Unit={
  id:string;code:string;name:string;bedrooms?:string;beds?:string;capacity:string;area:string;view:string;meal:string;
  extraAdult?:string;extraChild?:string;status:string;images?:string;amenities?:string;
  pricingBasis?:'room_night'|'unit_night'|'cabin_night'|'guest'|'package';guestType?:'adult'|'child'|'all';
};
type Product={slug:string;units?:Unit[]};
const money=pricingMoney;
const fmt=(n:number)=>new Intl.NumberFormat('vi-VN').format(n)+'đ';

export function PublishedUnits({slug,label='Căn / hạng phòng',providedUnits}:{slug:string;label?:string;providedUnits?:Unit[]}){
 const params=useSearchParams();
 const checkin=params.get('checkin');
 const checkout=params.get('checkout');
 const[units,setUnits]=useState<Unit[]>([]);
 const[rev,setRev]=useState(0);
 useEffect(()=>{
  const load=()=>{
   if(Array.isArray(providedUnits)){setUnits(providedUnits.filter(u=>u.status!=='hidden'));return}
   try{
    const raw=localStorage.getItem('tn_cms_products_v3_units');
    const products:Product[]=raw?JSON.parse(raw):[];
    const cms=products.find(p=>p.slug===slug)?.units||[];
    if(cms.length){setUnits(cms.filter(u=>u.status!=='hidden'));return}
    const partner=readPartnerPublic().products.find(p=>p.slug===slug);
    setUnits(((partner?.units||[]) as Unit[]).filter(u=>u.status!=='hidden'));
   }catch{setUnits([])}
  };
  const refresh=()=>{load();setRev(x=>x+1)};
  load();
  window.addEventListener('tn-products-updated',refresh);
  window.addEventListener('happygo-partner-products-updated',refresh);
  window.addEventListener('tn-rates-updated',refresh);
  window.addEventListener('storage',refresh);
  return()=>{
   window.removeEventListener('tn-products-updated',refresh);
   window.removeEventListener('happygo-partner-products-updated',refresh);
   window.removeEventListener('tn-rates-updated',refresh);
   window.removeEventListener('storage',refresh);
  };
 },[slug,providedUnits]);
 const selectedDates=useMemo(()=>{
  if(!checkin)return[];
  const s=new Date(`${checkin}T12:00:00`);
  const e=checkout?new Date(`${checkout}T12:00:00`):new Date(s.getFullYear(),s.getMonth(),s.getDate()+1);
  const a:Date[]=[];
  for(let d=s;d<e;d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1))a.push(d);
  return a;
 },[checkin,checkout]);
 const choose=(u:Unit)=>window.dispatchEvent(new CustomEvent('tn:select-unit',{detail:{id:u.id,unitId:u.id,code:u.code,name:u.name,pricingBasis:u.pricingBasis,guestType:u.guestType}}));
 const selectLabel=(u:Unit)=>u.pricingBasis==='guest'?'Chọn vé':u.pricingBasis==='package'?'Chọn gói':u.pricingBasis==='cabin_night'||/cabin/i.test(label)?'Chọn cabin':u.pricingBasis==='unit_night'||/(villa|căn)/i.test(label)?'Chọn căn':'Chọn phòng';
 if(!units.length)return null;
 return <section className="detail-block live-units" id="units">
  <div className="live-units-head"><h2>{label}</h2><p>{checkin?'Giá dưới từng hạng được lấy trực tiếp từ lịch giá thật theo ngày khách chọn.':'Chọn ngày trên Lịch giá phía trên hoặc trong khung đặt phòng để xem đúng giá bán của từng hạng.'}</p></div>
  <div className="live-unit-list">{units.map(u=>{
   const stayBasis=u.pricingBasis!=='guest'&&u.pricingBasis!=='package';
   const photos=(u.images||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
   const calendarRates=ratesForUnit(u.id);
   const effectiveDates=stayBasis?selectedDates:selectedDates.slice(0,1);
   const dayInfo=effectiveDates.map(date=>{
    const rate=rateForDate(u.id,pricingDateKey(date));
    const unavailable=Boolean(rate&&(rate.status!=='available'||Number(rate.quantity||0)<=0));
    const price=rate&&!unavailable?ratePriceForDate(rate,date):0;
    const missing=!rate||(!unavailable&&!price);
    return{date,rate,price,unavailable,missing};
   });
   const exactReady=effectiveDates.length>0&&dayInfo.every(x=>!x.missing&&!x.unavailable&&x.price>0);
   const vals=dayInfo.map(x=>x.price).filter(Boolean);
   const min=vals.length?Math.min(...vals):0;
   const max=vals.length?Math.max(...vals):0;
   const exactRates=dayInfo.map(x=>x.rate).filter(Boolean);
   const minQty=exactRates.length?Math.min(...exactRates.map(r=>Number(r!.quantity||0))):null;
   const minStay=stayBasis&&exactRates.length?Math.max(...exactRates.map(r=>Number(r!.minStay||1))):1;
   const oldVals=exactRates.map(r=>money(r!.oldPrice)).filter(Boolean);
   const oldPrice=oldVals.length?Math.max(...oldVals):0;
   const stayOk=!stayBasis||!selectedDates.length||selectedDates.length>=minStay;
   const sold=dayInfo.some(x=>x.unavailable);
   const baseAvailable=u.status==='available'&&stayOk&&!sold;
   const unitSuffix=u.pricingBasis==='guest'?'/ khách':u.pricingBasis==='package'?'/ gói':u.pricingBasis==='unit_night'?'/ căn/đêm':u.pricingBasis==='cabin_night'?'/ cabin/đêm':'/ phòng/đêm';
   return <article key={`${u.id}_${rev}`}>
    <div className="live-unit-main">
     <div className="live-unit-info"><b>{u.name||'Chưa đặt tên'}</b><small>{u.code||'Chưa có mã'}{u.bedrooms?` · ${u.bedrooms} phòng ngủ`:''}{u.beds?` · ${u.beds}`:''}{u.capacity?` · ${u.capacity}`:' · Sức chứa liên hệ'}{u.area?` · ${u.area}`:''}{u.view?` · ${u.view}`:''}</small>{u.meal&&<span>{u.meal}</span>}{u.amenities&&<span>{u.amenities}</span>}{effectiveDates.length&&minQty!==null&&minQty>0&&minQty<50&&<span className="availability-note">Còn {minQty} đơn vị theo lịch ngày đã chọn</span>}</div>
     {photos.length>0&&<UnitPhotoGallery title={u.name||'Hạng phòng'} images={photos} kind={/villa|căn/i.test(label)?'villa':'hotel'}/>} 
    </div>
    {effectiveDates.length&&<div className={`selected-date-price ${exactReady?'exact':'missing'}`}>
     {oldPrice>max&&<del>{fmt(oldPrice)}</del>}
     <small>{exactReady?'GIÁ XÁC NHẬN THEO NGÀY':'GIÁ NGÀY ĐÃ CHỌN'}</small>
     <b>{exactReady?(min===max?fmt(min):`${fmt(min)} – ${fmt(max)}`):sold?'Hết / tạm giữ':'Chưa mở giá'}</b>
     <em>{exactReady?`Lấy trực tiếp từ lịch giá production ${unitSuffix}${stayBasis&&selectedDates.length>1?` · ${selectedDates.length} đêm`:''}`:'Ngày này chưa có giá xác nhận trong lịch.'}</em>
    </div>}
    <em className={`unit-public-status ${baseAvailable?'available':'soldout'}`}>{effectiveDates.length?(exactReady?'Có giá xác nhận':sold?'Hết / tạm giữ':'Chờ mở giá'):(calendarRates.length?'Có lịch giá':'Chưa có lịch giá')}</em>
    {baseAvailable?<a href="#booking" onClick={()=>choose(u)}>{exactReady?selectLabel(u):effectiveDates.length?'Yêu cầu giá':selectLabel(u)}</a>:<span className="unit-unavailable">Chưa thể đặt</span>}
   </article>;
  })}</div>
 </section>;
}
