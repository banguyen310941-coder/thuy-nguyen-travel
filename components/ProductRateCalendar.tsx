'use client';

import {useCallback,useEffect,useMemo,useState} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {RATE_KEY,ratePriceForDate,type RateRange} from '@/components/AdminRateCalendar';
import {pricingDateKey} from '@/lib/pricing-calendar';

type Unit={id:string;code?:string;name:string;status?:string};
const readRates=():RateRange[]=>{try{const raw=JSON.parse(localStorage.getItem(RATE_KEY)||'[]');return Array.isArray(raw)?raw:[]}catch{return[]}};
const compact=(n:number)=>n>=1000000?`${new Intl.NumberFormat('vi-VN',{maximumFractionDigits:1}).format(n/1000000)}tr`:`${Math.round(n/1000)}k`;
const monthName=(date:Date)=>new Intl.DateTimeFormat('vi-VN',{month:'long',year:'numeric'}).format(date);
const nextDateKey=(date:Date)=>{const next=new Date(date.getFullYear(),date.getMonth(),date.getDate()+1);return pricingDateKey(next)};

export function ProductRateCalendar({units,label='Lịch giá theo ngày'}:{units:Unit[];label?:string}){
  const router=useRouter();
  const pathname=usePathname();
  const availableUnits=useMemo(()=>units.filter(u=>u.status!=='hidden'),[units]);
  const [unitId,setUnitId]=useState(availableUnits[0]?.id||'');
  const [month,setMonth]=useState(()=>{const now=new Date();return new Date(now.getFullYear(),now.getMonth(),1)});
  const [allRates,setAllRates]=useState<RateRange[]>([]);
  const [ratesLoaded,setRatesLoaded]=useState(false);
  const [selected,setSelected]=useState('');

  useEffect(()=>{if(!availableUnits.some(u=>u.id===unitId))setUnitId(availableUnits[0]?.id||'')},[availableUnits,unitId]);

  const loadProductionRates=useCallback(async()=>{
    try{
      const response=await fetch('/api/catalog/site-state',{cache:'no-store',headers:{accept:'application/json'}});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const payload=await response.json();
      const incoming=Array.isArray(payload?.rates)?payload.rates as RateRange[]:[];
      setAllRates(incoming);
      setRatesLoaded(true);
      try{localStorage.setItem(RATE_KEY,JSON.stringify(incoming))}catch{}
      window.dispatchEvent(new Event('tn-rates-production-loaded'));
    }catch{
      setAllRates(readRates());
      setRatesLoaded(true);
    }
  },[]);

  useEffect(()=>{
    void loadProductionRates();
    const refresh=()=>void loadProductionRates();
    const online=()=>void loadProductionRates();
    window.addEventListener('tn-rates-updated',refresh);
    window.addEventListener('tn-products-updated',refresh);
    window.addEventListener('online',online);
    return()=>{
      window.removeEventListener('tn-rates-updated',refresh);
      window.removeEventListener('tn-products-updated',refresh);
      window.removeEventListener('online',online);
    };
  },[loadProductionRates]);

  useEffect(()=>{const read=()=>setSelected(new URLSearchParams(window.location.search).get('checkin')||'');read();window.addEventListener('popstate',read);window.addEventListener('tn-pricing-dates-updated',read);return()=>{window.removeEventListener('popstate',read);window.removeEventListener('tn-pricing-dates-updated',read)}},[]);

  const unit=availableUnits.find(u=>u.id===unitId)||availableUnits[0];
  const rates=useMemo(()=>allRates.filter(r=>r.unitId===unitId),[allRates,unitId]);
  const year=month.getFullYear(),monthIndex=month.getMonth();
  const first=new Date(year,monthIndex,1);const last=new Date(year,monthIndex+1,0);const leading=(first.getDay()+6)%7;
  const cells=Array.from({length:leading+last.getDate()},(_,index)=>index<leading?null:new Date(year,monthIndex,index-leading+1));
  while(cells.length%7)cells.push(null);
  const today=pricingDateKey(new Date());
  const rateFor=(key:string)=>{const matches=rates.filter(r=>r.start&&r.end&&key>=r.start&&key<=r.end);return matches.length?matches[matches.length-1]:null};
  const chooseDate=(date:Date,price:number,unavailable:boolean)=>{const key=pricingDateKey(date);if(key<today||unavailable||!price)return;const next=new URLSearchParams(window.location.search);next.set('checkin',key);next.set('checkout',nextDateKey(date));router.replace(`${pathname}?${next.toString()}`,{scroll:false});setSelected(key);window.dispatchEvent(new Event('tn-pricing-dates-updated'));setTimeout(()=>document.getElementById('units')?.scrollIntoView({behavior:'smooth',block:'start'}),50)};

  if(!unit)return null;
  return <section id="rate-calendar" className="pd-block public-rate-calendar">
    <div className="prc-head"><div><h2>📅 {label}</h2><p><b>Đây là giá bán chính xác theo từng ngày.</b> Giá được đọc trực tiếp từ dữ liệu production; giá gốc đã được cộng biên lợi nhuận trước khi hiển thị.</p></div><label><span>Hạng đang xem</span><select value={unit.id} onChange={e=>setUnitId(e.target.value)}>{availableUnits.map(u=><option value={u.id} key={u.id}>{u.code?`${u.code} · `:''}{u.name}</option>)}</select></label></div>
    <div className="prc-month"><button type="button" onClick={()=>setMonth(new Date(year,monthIndex-1,1))}>‹</button><b>{monthName(month)}</b><button type="button" onClick={()=>setMonth(new Date(year,monthIndex+1,1))}>›</button></div>
    <div className="prc-weekdays">{['T2','T3','T4','T5','T6','T7','CN'].map(x=><span key={x}>{x}</span>)}</div>
    <div className="prc-grid">{cells.map((date,index)=>{
      if(!date)return <span className="prc-empty" key={`empty_${index}`}/>;
      const key=pricingDateKey(date);
      const rate=rateFor(key);
      const unavailable=Boolean(rate&&(rate.status!=='available'||Number(rate.quantity||0)<=0));
      const price=rate&&!unavailable?ratePriceForDate(rate,date):0;
      const missing=ratesLoaded&&(!rate||(!unavailable&&!price));
      const loading=!ratesLoaded;
      const disabled=key<today||unavailable||missing||loading;
      const className=[key<today?'past':'',unavailable?'soldout':'',missing?'unpriced':'',loading?'loading':'',key===selected?'selected':'',!disabled?'clickable':''].filter(Boolean).join(' ');
      const status=loading?'Đang tải':unavailable?'Hết':missing?'Chưa mở':compact(price);
      return <button type="button" className={className} key={key} disabled={disabled} onClick={()=>chooseDate(date,price,unavailable)} title={loading?'Đang tải giá production':missing?'Ngày này chưa có giá bán chính xác trong lịch production':unavailable?'Ngày này hiện không còn bán':`Chọn ngày ${key} · ${new Intl.NumberFormat('vi-VN').format(price)}đ`}><small>{date.getDate()}</small><b>{status}</b>{rate?.note&&<em>{rate.note}</em>}</button>;
    })}</div>
    <div className="prc-note"><span>Giá trên lịch là nguồn giá xác nhận. Bấm ngày có giá để chọn nhanh 1 đêm.</span><a href="#booking">Hoặc chọn ngày trong khung đặt phòng →</a></div>
  </section>;
}
