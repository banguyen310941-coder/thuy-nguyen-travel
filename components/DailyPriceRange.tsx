'use client';

import {useEffect,useMemo,useState} from 'react';
import {rateForDate,ratePriceCandidates,ratePriceForDate,ratesForUnit} from '@/components/AdminRateCalendar';
import {allSeasonalPriceCandidates,seasonalPriceCandidates,seasonalUnitPrice} from '@/lib/pricing-calendar';

type Unit={
  id:string;
  weekdayPrice?:string;
  weekendPrice?:string;
  holidayPrice?:string;
  lowWeekdayPrice?:string;
  lowWeekendPrice?:string;
  highWeekdayPrice?:string;
  highWeekendPrice?:string;
  status?:string;
};
type Product={slug:string;price?:string;units?:Unit[]};
const KEY='tn_cms_products_v3_units';
const fmt=(n:number)=>new Intl.NumberFormat('vi-VN').format(n)+'đ';
const cleanStartingText=(value?:string)=>String(value||'').trim().replace(/^từ\s+/i,'')||'Liên hệ';
const dateKey=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

function priceForDate(u:Unit,d:Date){
  const rate=rateForDate(u.id,dateKey(d));
  if(rate){
    const qty=Number(rate.quantity||0);
    if(rate.status!=='available'||qty<=0)return 0;
    return ratePriceForDate(rate,d)||seasonalUnitPrice(u,d,rate.season||null);
  }
  return seasonalUnitPrice(u,d,null);
}

export function DailyPriceRange({slug,fallback='',checkin='',checkout='',compact=false}:{slug:string;fallback?:string;checkin?:string|null;checkout?:string|null;compact?:boolean}){
  const [product,setProduct]=useState<Product|null>(null);
  const [rev,setRev]=useState(0);
  useEffect(()=>{
    const load=()=>{try{const arr=JSON.parse(localStorage.getItem(KEY)||'[]') as Product[];setProduct(arr.find(p=>p.slug===slug)||null)}catch{setProduct(null)}};
    load();
    const refresh=()=>{load();setRev(x=>x+1)};
    window.addEventListener('tn-products-updated',refresh);
    window.addEventListener('tn-rates-updated',refresh);
    window.addEventListener('storage',refresh);
    return()=>{window.removeEventListener('tn-products-updated',refresh);window.removeEventListener('tn-rates-updated',refresh);window.removeEventListener('storage',refresh)};
  },[slug]);

  const range=useMemo(()=>{
    const active=(product?.units||[]).filter(u=>u.status!=='hidden'&&u.status!=='soldout');
    const vals:number[]=[];
    if(checkin){
      const start=new Date(`${checkin}T12:00:00`);
      const end=checkout?new Date(`${checkout}T12:00:00`):new Date(start.getFullYear(),start.getMonth(),start.getDate()+1);
      for(const u of active){
        for(let d=new Date(start);d<end;d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)){
          const p=priceForDate(u,d);
          if(p)vals.push(p);
        }
      }
    }else{
      for(const u of active){
        const seasonal=allSeasonalPriceCandidates(u);
        seasonal.forEach(v=>vals.push(v));
        const rates=ratesForUnit(u.id).filter(r=>r.status==='available'&&Number(r.quantity||0)>0);
        for(const rate of rates){
          const overrides=ratePriceCandidates(rate);
          if(overrides.length)overrides.forEach(v=>vals.push(v));
          else seasonalPriceCandidates(u,rate.season||null).forEach(v=>vals.push(v));
        }
      }
    }
    return vals.length?{min:Math.min(...vals),max:Math.max(...vals)}:null;
  },[product,checkin,checkout,rev]);

  const cls=compact?'daily-price compact':'daily-price';
  if(!range)return <span className={cls}><small>{checkin?'Giá ngày đã chọn':'Giá từ'}</small><b>{checkin?'Liên hệ kiểm tra phòng':cleanStartingText(product?.price||fallback)}</b></span>;
  if(!checkin)return <span className={cls}><small>Giá từ</small><b>{fmt(range.min)}</b><em>/ đêm</em></span>;
  return <span className={cls}><small>Giá ngày đã chọn</small><b>{range.min===range.max?fmt(range.min):`${fmt(range.min)} – ${fmt(range.max)}`}</b><em>/ đêm</em></span>;
}
export {dateKey};
