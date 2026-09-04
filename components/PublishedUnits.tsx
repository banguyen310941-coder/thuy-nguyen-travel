'use client';

import {useEffect,useMemo,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {rateForDate,ratePriceCandidates,ratePriceForDate,ratesForUnit,type RateRange} from '@/components/AdminRateCalendar';
import {readPartnerPublic} from '@/components/PartnerPublicCatalog';
import {UnitPhotoGallery} from '@/components/UnitPhotoGallery';
import {allSeasonalPriceCandidates,pricingDateKey,pricingMoney,seasonalPriceCandidates,seasonalUnitPrice} from '@/lib/pricing-calendar';

type Unit={
  id:string;
  code:string;
  name:string;
  bedrooms?:string;
  beds?:string;
  capacity:string;
  area:string;
  view:string;
  meal:string;
  weekdayPrice:string;
  weekendPrice:string;
  holidayPrice:string;
  lowWeekdayPrice?:string;
  lowWeekendPrice?:string;
  highWeekdayPrice?:string;
  highWeekendPrice?:string;
  extraAdult?:string;
  extraChild?:string;
  status:string;
  images?:string;
  amenities?:string;
  pricingBasis?:'room_night'|'unit_night'|'cabin_night'|'guest'|'package';
  guestType?:'adult'|'child'|'all';
};
type Product={slug:string;units?:Unit[]};
const money=pricingMoney;
const fmt=(n:number)=>new Intl.NumberFormat('vi-VN').format(n)+'đ';
const seasonName=(value?:string)=>value==='low'?'Thấp điểm':value==='high'?'Cao điểm':value==='holiday'?'Lễ / Tết':value==='custom'?'Đặc biệt':'Mùa thường';
const display=(value?:string,fallback?:string)=>String(value||fallback||'').trim()||'Liên hệ';

function rangeDisplayPrices(unit:Unit,rate:RateRange){
  const direct=ratePriceCandidates(rate);
  if(direct.length)return direct;
  return seasonalPriceCandidates(unit,rate.season||null);
}

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
    <div className="live-units-head"><h2>{label} đang quản lý</h2><p>{checkin?'Giá và tồn được tính theo đúng mùa và loại ngày của từng ngày đã chọn.':'Mỗi mùa có giá trong tuần và cuối tuần riêng. Chọn ngày để hệ thống lấy đúng mùa và đúng mức giá.'}</p></div>
    <div className="live-unit-list">{units.map(u=>{
      const stayBasis=u.pricingBasis!=='guest'&&u.pricingBasis!=='package';
      const allPhotos=(u.images||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
      const calendarRates=ratesForUnit(u.id).filter(r=>r.status==='available'&&Number(r.quantity||0)>0);
      const roomSeasonPrices=allSeasonalPriceCandidates(u);
      const overridePrices=calendarRates.flatMap(r=>ratePriceCandidates(r));
      const publicPrices=[...roomSeasonPrices,...overridePrices].filter(Boolean);
      const publicMin=publicPrices.length?Math.min(...publicPrices):0;
      const publicMax=publicPrices.length?Math.max(...publicPrices):0;
      const effectiveDates=stayBasis?selectedDates:selectedDates.slice(0,1);
      const dayInfo=effectiveDates.map(d=>{
        const r=rateForDate(u.id,pricingDateKey(d));
        const unavailable=Boolean(r&&(r.status!=='available'||Number(r.quantity||0)<=0));
        const price=unavailable?0:(r?ratePriceForDate(r,d)||seasonalUnitPrice(u,d,r.season||null):seasonalUnitPrice(u,d,null));
        return {date:d,rate:r,price};
      });
      const vals=dayInfo.map(x=>x.price).filter(Boolean);
      const min=vals.length?Math.min(...vals):0;
      const max=vals.length?Math.max(...vals):0;
      const custom=dayInfo.map(x=>x.rate).filter(Boolean);
      const soldByCalendar=custom.some(r=>r!.status!=='available'||Number(r!.quantity||0)<=0);
      const minQty=custom.length?Math.min(...custom.map(r=>Number(r!.quantity||0))):null;
      const minStay=stayBasis&&custom.length?Math.max(...custom.map(r=>Number(r!.minStay||1))):1;
      const oldVals=custom.map(r=>money(r!.oldPrice)).filter(Boolean);
      const oldPrice=oldVals.length?Math.max(...oldVals):0;
      const stayOk=!stayBasis||!selectedDates.length||selectedDates.length>=minStay;
      const available=u.status==='available'&&!soldByCalendar&&stayOk;
      const unitSuffix=u.pricingBasis==='guest'?'/ khách':u.pricingBasis==='package'?'/ gói':u.pricingBasis==='unit_night'?'/ căn/đêm':u.pricingBasis==='cabin_night'?'/ cabin/đêm':'/ phòng/đêm';
      const seasonalRanges=calendarRates.sort((a,b)=>a.start.localeCompare(b.start)).slice(0,5);
      const lowWeekday=display(u.lowWeekdayPrice,u.weekdayPrice);
      const lowWeekend=display(u.lowWeekendPrice,u.lowWeekdayPrice||u.weekendPrice||u.weekdayPrice);
      const regularWeekday=display(u.weekdayPrice);
      const regularWeekend=display(u.weekendPrice,u.weekdayPrice);
      const highWeekday=display(u.highWeekdayPrice,u.weekdayPrice);
      const highWeekend=display(u.highWeekendPrice,u.highWeekdayPrice||u.weekendPrice||u.weekdayPrice);

      return <article key={`${u.id}_${rev}`}>
        <div className="live-unit-main">
          <div className="live-unit-info"><b>{u.name||'Chưa đặt tên'}</b><small>{u.code||'Chưa có mã'}{u.bedrooms?` · ${u.bedrooms} phòng ngủ`:''}{u.beds?` · ${u.beds}`:''}{u.capacity?` · ${u.capacity}`:' · Sức chứa liên hệ'}{u.area?` · ${u.area}`:''}{u.view?` · ${u.view}`:''}</small>{u.meal&&<span>{u.meal}</span>}{u.amenities&&<span>{u.amenities}</span>}{u.pricingBasis==='guest'&&<span>{u.guestType==='adult'?'Vé người lớn':u.guestType==='child'?'Vé trẻ em':'Vé áp dụng mọi khách'}</span>}{effectiveDates.length&&minQty!==null&&minQty>0&&minQty<50&&<span className="availability-note">Chỉ còn {minQty} {u.pricingBasis==='guest'?'suất':u.pricingBasis==='package'?'gói':'đơn vị'} cho ngày đã chọn</span>}</div>
          {allPhotos.length>0&&<UnitPhotoGallery title={u.name||'Hạng phòng'} images={allPhotos} kind={/villa|căn/i.test(label)?'villa':'hotel'}/>} 
        </div>

        {effectiveDates.length?<div className="selected-date-price">
          {oldPrice>max&&<del>{fmt(oldPrice)}</del>}
          <small>GIÁ ĐÚNG CHO NGÀY ĐÃ CHỌN</small>
          <b>{min?min===max?fmt(min):`${fmt(min)} – ${fmt(max)}`:'Không còn'}</b>
          <em>{unitSuffix}{stayBasis&&selectedDates.length>1?` · ${selectedDates.length} đêm`:''}{stayBasis&&minStay>1?` · tối thiểu ${minStay} đêm`:''}</em>
          {u.extraAdult&&<span>Phụ thu người lớn: <b>{u.extraAdult}</b></span>}{u.extraChild&&<span>Phụ thu trẻ em: <b>{u.extraChild}</b></span>}
        </div>:<>
          <div className="selected-date-price"><small>GIÁ THAM KHẢO</small><b>{publicMin?`Từ ${fmt(publicMin)}`:'Liên hệ'}</b>{publicMin&&publicMax&&publicMin!==publicMax?<em>Giá thay đổi theo mùa và trong tuần/cuối tuần</em>:null}</div>
          {stayBasis?<div className="live-season-defaults">
            <div className="season-low"><strong>Mùa thấp điểm</strong><span><small>Trong tuần</small><b>{lowWeekday}</b></span><span><small>Cuối tuần T6–T7</small><b>{lowWeekend}</b></span></div>
            <div className="season-regular"><strong>Mùa thường</strong><span><small>Trong tuần</small><b>{regularWeekday}</b></span><span><small>Cuối tuần T6–T7</small><b>{regularWeekend}</b></span></div>
            <div className="season-high"><strong>Mùa cao điểm</strong><span><small>Trong tuần</small><b>{highWeekday}</b></span><span><small>Cuối tuần T6–T7</small><b>{highWeekend}</b></span></div>
            <div className="season-holiday"><strong>Lễ / Tết</strong><span className="wide"><small>Giá áp dụng</small><b>{display(u.holidayPrice)}</b></span></div>
          </div>:<div className="live-unit-prices"><span><small>Giá cơ bản</small><b>{u.weekdayPrice||'Liên hệ'}</b></span><span><small>Cuối tuần / cao điểm</small><b>{u.weekendPrice||u.weekdayPrice||'Liên hệ'}</b></span><span><small>Lễ/Tết</small><b>{u.holidayPrice||'Liên hệ'}</b></span></div>}
          {seasonalRanges.length>0&&<div className="live-season-rates"><div className="live-season-rates-title">Khoảng mùa đang áp dụng</div>{seasonalRanges.map(r=>{
            const prices=rangeDisplayPrices(u,r);
            const rangeMin=prices.length?Math.min(...prices):0;
            const rangeMax=prices.length?Math.max(...prices):0;
            return <div key={r.id}><strong>{seasonName(r.season)}</strong><small>{r.start} → {r.end}</small><span><b>{rangeMin?rangeMin===rangeMax?fmt(rangeMin):`${fmt(rangeMin)} – ${fmt(rangeMax)}`:'Theo bảng giá mùa'}</b>{ratePriceCandidates(r).length>0&&<i>Giá ghi đè riêng</i>}</span></div>;
          })}</div>}
          {u.extraAdult&&<div className="unit-extra-fee">Phụ thu người lớn: <b>{u.extraAdult}</b></div>}{u.extraChild&&<div className="unit-extra-fee">Phụ thu trẻ em: <b>{u.extraChild}</b></div>}
        </>}

        <em className={`unit-public-status ${available?'available':'soldout'}`}>{available?'Còn bán':!stayOk?`Tối thiểu ${minStay} đêm`:'Hết / tạm giữ'}</em>
        {available?<a href="#booking" onClick={()=>choose(u)}>{selectLabel(u)}</a>:<span className="unit-unavailable">Chưa thể đặt</span>}
      </article>;
    })}</div>
  </section>;
}
