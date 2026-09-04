'use client';

import {useEffect,useMemo,useState} from 'react';
import {RATE_KEY,ratePriceForDate,type RateRange} from '@/components/AdminRateCalendar';
import {pricingDateKey,seasonalUnitPrice} from '@/lib/pricing-calendar';

type Unit={
  id:string;
  code?:string;
  name:string;
  weekdayPrice?:string;
  weekendPrice?:string;
  holidayPrice?:string;
  lowWeekdayPrice?:string;
  lowWeekendPrice?:string;
  highWeekdayPrice?:string;
  highWeekendPrice?:string;
  status?:string;
};
const readRates=():RateRange[]=>{try{const raw=JSON.parse(localStorage.getItem(RATE_KEY)||'[]');return Array.isArray(raw)?raw:[]}catch{return[]}};
const compact=(n:number)=>n>=1000000?`${new Intl.NumberFormat('vi-VN',{maximumFractionDigits:1}).format(n/1000000)}tr`:`${Math.round(n/1000)}k`;
const monthName=(date:Date)=>new Intl.DateTimeFormat('vi-VN',{month:'long',year:'numeric'}).format(date);
const seasonText=(season?:RateRange['season'])=>season==='low'?'Thấp điểm':season==='high'?'Cao điểm':season==='holiday'?'Lễ/Tết':season==='custom'?'Đặc biệt':season==='regular'?'Mùa thường':'';

export function ProductRateCalendar({units,label='Lịch giá theo ngày'}:{units:Unit[];label?:string}){
  const availableUnits=useMemo(()=>units.filter(u=>u.status!=='hidden'),[units]);
  const [unitId,setUnitId]=useState(availableUnits[0]?.id||'');
  const [month,setMonth]=useState(()=>{const now=new Date();return new Date(now.getFullYear(),now.getMonth(),1)});
  const [rev,setRev]=useState(0);
  useEffect(()=>{if(!availableUnits.some(u=>u.id===unitId))setUnitId(availableUnits[0]?.id||'')},[availableUnits,unitId]);
  useEffect(()=>{const refresh=()=>setRev(x=>x+1);window.addEventListener('tn-rates-updated',refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener('tn-rates-updated',refresh);window.removeEventListener('storage',refresh)}},[]);
  const unit=availableUnits.find(u=>u.id===unitId)||availableUnits[0];
  const rates=useMemo(()=>readRates().filter(r=>r.unitId===unitId),[unitId,rev]);
  const year=month.getFullYear(),monthIndex=month.getMonth();
  const first=new Date(year,monthIndex,1);const last=new Date(year,monthIndex+1,0);const leading=(first.getDay()+6)%7;
  const cells=Array.from({length:leading+last.getDate()},(_,index)=>index<leading?null:new Date(year,monthIndex,index-leading+1));
  while(cells.length%7)cells.push(null);
  const today=pricingDateKey(new Date());
  const rateFor=(key:string)=>{const matches=rates.filter(r=>r.start&&r.end&&key>=r.start&&key<=r.end);return matches.length?matches[matches.length-1]:null};
  if(!unit)return null;
  return <section id="rate-calendar" className="pd-block public-rate-calendar">
    <div className="prc-head"><div><h2>📅 {label}</h2><p>Khoảng ngày xác định mùa; giá trong tuần/cuối tuần được lấy từ đúng bảng giá mùa của hạng phòng. Giá ghi đè theo ngày, nếu có, được ưu tiên cao hơn.</p></div><label><span>Hạng đang xem</span><select value={unit.id} onChange={e=>setUnitId(e.target.value)}>{availableUnits.map(u=><option value={u.id} key={u.id}>{u.code?`${u.code} · `:''}{u.name}</option>)}</select></label></div>
    <div className="prc-month"><button type="button" onClick={()=>setMonth(new Date(year,monthIndex-1,1))}>‹</button><b>{monthName(month)}</b><button type="button" onClick={()=>setMonth(new Date(year,monthIndex+1,1))}>›</button></div>
    <div className="prc-weekdays">{['T2','T3','T4','T5','T6','T7','CN'].map(x=><span key={x}>{x}</span>)}</div>
    <div className="prc-grid">{cells.map((date,index)=>{
      if(!date)return <span className="prc-empty" key={`empty_${index}`}/>;
      const key=pricingDateKey(date);
      const rate=rateFor(key);
      const unavailable=Boolean(rate&&(rate.status!=='available'||Number(rate.quantity||0)<=0));
      const override=rate&&!unavailable?ratePriceForDate(rate,date):0;
      const price=unavailable?0:override||seasonalUnitPrice(unit,date,rate?.season||null);
      const tag=rate?seasonText(rate.season):'';
      const note=[tag,rate?.note].filter(Boolean).join(' · ');
      return <div className={`${key<today?'past':''} ${unavailable?'soldout':''}`} key={key}><small>{date.getDate()}</small><b>{unavailable?'Hết':price?compact(price):'Liên hệ'}</b>{note&&<em title={note}>{note}</em>}</div>;
    })}</div>
    <div className="prc-note"><span>Giá hiển thị cho 1 đêm, đúng mùa và đúng trong tuần/cuối tuần.</span><a href="#booking">Chọn ngày trong khung đặt phòng →</a></div>
  </section>;
}
