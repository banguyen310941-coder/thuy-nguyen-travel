'use client';

import {useEffect,useMemo,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {UnitPhotoGallery} from '@/components/UnitPhotoGallery';
import {pricingDateKey,pricingMoney} from '@/lib/pricing-calendar';
import {rateForDate,ratePriceCandidates,ratePriceForDate,ratesForUnit,type PublicRateRange} from '@/lib/public-rate-utils';
import type {PartnerPublicProduct} from '@/components/PartnerPublicCatalog';

type Unit={
  id:string;code:string;name:string;bedrooms?:string;beds?:string;capacity:string;area:string;view:string;meal:string;
  extraAdult?:string;extraChild?:string;status:string;images?:string;amenities?:string;
  pricingBasis?:'room_night'|'unit_night'|'cabin_night'|'guest'|'package';guestType?:'adult'|'child'|'all';
};
type Product={slug:string;units?:Unit[]};
const money=pricingMoney;
const fmt=(n:number)=>new Intl.NumberFormat('vi-VN').format(n)+'đ';

export function PublishedUnits({slug,label='Căn / hạng phòng',providedUnits,initialRates=[]}:{slug:string;label?:string;providedUnits?:Unit[];initialRates?:PublicRateRange[]}){
 const params=useSearchParams();
 const checkin=params.get('checkin');
 const checkout=params.get('checkout');
 const[units,setUnits]=useState<Unit[]>(()=>Array.isArray(providedUnits)?providedUnits.filter(u=>u.status!=='hidden'):[]);
 const[allRates,setAllRates]=useState<PublicRateRange[]>(initialRates);
 const[rev,setRev]=useState(0);
 useEffect(()=>{if(Array.isArray(providedUnits))setUnits(providedUnits.filter(u=>u.status!=='hidden'))},[providedUnits]);
 useEffect(()=>setAllRates(initialRates),[initialRates]);
 useEffect(()=>{
  let alive=true;
  const load=async()=>{
   try{
    const response=await fetch('/api/catalog/site-state',{cache:'no-store'});
    if(response.ok){
     const payload=await response.json() as{state?:Record<string,unknown>};
     const products=payload.state?.tn_cms_products_v3_units;
     const rates=payload.state?.tn_cms_daily_rates_v1;
     if(alive&&Array.isArray(rates))setAllRates(rates as PublicRateRange[]);
     if(alive&&!Array.isArray(providedUnits)&&Array.isArray(products)){
      const cms=(products as Product[]).find(p=>p.slug===slug)?.units||[];
      if(cms.length){setUnits(cms.filter(u=>u.status!=='hidden'));setRev(x=>x+1);return}
     }
    }
    if(!Array.isArray(providedUnits)){
     const partnerResponse=await fetch('/api/catalog/partner-products',{cache:'no-store'});
     if(partnerResponse.ok){const data=await partnerResponse.json() as{products?:PartnerPublicProduct[]};const partner=Array.isArray(data.products)?data.products.find(p=>p.slug===slug):undefined;if(alive)setUnits(((partner?.units||[]) as Unit[]).filter(u=>u.status!=='hidden'))}
    }
    if(alive)setRev(x=>x+1);
   }catch{if(alive)setRev(x=>x+1)}
  };
  void load();
  const refresh=()=>void load();
  window.addEventListener('tn-products-updated',refresh);
  window.addEventListener('tn-rates-updated',refresh);
  window.addEventListener('happygo-partner-products-updated',refresh);
  window.addEventListener('happygo-partner-rates-updated',refresh);
  return()=>{
   alive=false;
   window.removeEventListener('tn-products-updated',refresh);
   window.removeEventListener('tn-rates-updated',refresh);
   window.removeEventListener('happygo-partner-products-updated',refresh);
   window.removeEventListener('happygo-partner-rates-updated',refresh);
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
 const today=pricingDateKey(new Date());
 return <section className="detail-block live-units" id="units">
  <div className="live-units-head"><h2>{label}</h2><p>{checkin?'Giá dưới từng hạng được lấy trực tiếp từ lịch giá thật theo ngày khách chọn.':'Giá từ bên dưới được đọc từ lịch giá production. Chọn ngày để xem đúng giá bán của ngày lưu trú.'}</p></div>
  <div className="live-unit-list">{units.map(u=>{
   const stayBasis=u.pricingBasis!=='guest'&&u.pricingBasis!=='package';
   const photos=(u.images||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
   const calendarRates=ratesForUnit(allRates,u.id);
   const upcomingPrices=calendarRates.filter(r=>r.end>=today&&r.status==='available'&&Number(r.quantity||0)>0).flatMap(ratePriceCandidates).filter(Boolean);
   const startingPrice=upcomingPrices.length?Math.min(...upcomingPrices):0;
   const effectiveDates=stayBasis?selectedDates:selectedDates.slice(0,1);
   const dayInfo=effectiveDates.map(date=>{
    const rate=rateForDate(allRates,u.id,pricingDateKey(date));
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
    {effectiveDates.length?<div className={`selected-date-price ${exactReady?'exact':'missing'}`}>
     {oldPrice>max&&<del>{fmt(oldPrice)}</del>}
     <small>{exactReady?'GIÁ XÁC NHẬN THEO NGÀY':'GIÁ NGÀY ĐÃ CHỌN'}</small>
     <b>{exactReady?(min===max?fmt(min):`${fmt(min)} – ${fmt(max)}`):sold?'Hết / tạm giữ':'Chưa mở giá'}</b>
     <em>{exactReady?`Giá bán theo lịch ${unitSuffix}${stayBasis&&selectedDates.length>1?` · ${selectedDates.length} đêm`:''}`:'Ngày này chưa có giá xác nhận trong lịch.'}</em>
    </div>:<div className={`selected-date-price starting ${startingPrice?'exact':'missing'}`}>
     <small>GIÁ BÁN TỪ LỊCH</small>
     <b>{startingPrice?fmt(startingPrice):'Đang tải giá'}</b>
     <em>{startingPrice?`${unitSuffix} · chọn ngày để xem giá chính xác`:'Đang đồng bộ lịch giá production.'}</em>
    </div>}
    <em className={`unit-public-status ${baseAvailable?'available':'soldout'}`}>{effectiveDates.length?(exactReady?'Có giá xác nhận':sold?'Hết / tạm giữ':'Chờ mở giá'):(calendarRates.length?'Có lịch giá':'Đang tải lịch giá')}</em>
    {baseAvailable?<a href="#booking" onClick={()=>choose(u)}>{exactReady?selectLabel(u):effectiveDates.length?'Yêu cầu giá':selectLabel(u)}</a>:<span className="unit-unavailable">Chưa thể đặt</span>}
   </article>;
  })}</div>
 </section>;
}
