export type PricingDayKind='weekday'|'weekend'|'holiday';
export type PricingSeason='low'|'regular'|'high'|'holiday'|'custom';
export type DatePriceSource={
  weekdayPrice?:string|number|null;
  weekendPrice?:string|number|null;
  holidayPrice?:string|number|null;
  lowWeekdayPrice?:string|number|null;
  lowWeekendPrice?:string|number|null;
  highWeekdayPrice?:string|number|null;
  highWeekendPrice?:string|number|null;
};

export const VIETNAM_FIXED_PRICING_HOLIDAYS=new Set(['01-01','04-30','05-01','09-02']);

export function pricingMoney(v?:string|number|null){if(typeof v==='number')return Number.isFinite(v)?Math.round(v):0;const d=String(v||'').replace(/\D/g,'');return d?Number(d):0}
export function pricingDateKey(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function parsePricingDate(value:string){const[y,m,d]=value.split('-').map(Number);return new Date(y,m-1,d,12)}
export function pricingDayKind(d:Date):PricingDayKind{const md=`${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;if(VIETNAM_FIXED_PRICING_HOLIDAYS.has(md))return'holiday';const day=d.getDay();return day===5||day===6?'weekend':'weekday'}
export function fallbackUnitPrice(unit:DatePriceSource,date:Date){const weekday=pricingMoney(unit.weekdayPrice),weekend=pricingMoney(unit.weekendPrice)||weekday,holiday=pricingMoney(unit.holidayPrice)||weekend||weekday;const kind=pricingDayKind(date);return kind==='holiday'?holiday:kind==='weekend'?weekend:weekday}
export function seasonalUnitPrice(unit:DatePriceSource,date:Date,season?:PricingSeason|null){
  const kind=pricingDayKind(date);
  const regularWeekday=pricingMoney(unit.weekdayPrice);
  const regularWeekend=pricingMoney(unit.weekendPrice)||regularWeekday;
  const holiday=pricingMoney(unit.holidayPrice)||regularWeekend||regularWeekday;
  if(kind==='holiday'||season==='holiday')return holiday;
  if(season==='low'){
    const weekday=pricingMoney(unit.lowWeekdayPrice)||regularWeekday;
    const weekend=pricingMoney(unit.lowWeekendPrice)||weekday||regularWeekend;
    return kind==='weekend'?weekend:weekday;
  }
  if(season==='high'){
    const weekday=pricingMoney(unit.highWeekdayPrice)||regularWeekday;
    const weekend=pricingMoney(unit.highWeekendPrice)||weekday||regularWeekend;
    return kind==='weekend'?weekend:weekday;
  }
  return kind==='weekend'?regularWeekend:regularWeekday;
}
export function seasonalPriceCandidates(unit:DatePriceSource,season?:PricingSeason|null){
  const regularWeekday=pricingMoney(unit.weekdayPrice),regularWeekend=pricingMoney(unit.weekendPrice)||regularWeekday,holiday=pricingMoney(unit.holidayPrice)||regularWeekend||regularWeekday;
  if(season==='holiday')return [holiday].filter(Boolean);
  if(season==='low')return [pricingMoney(unit.lowWeekdayPrice)||regularWeekday,pricingMoney(unit.lowWeekendPrice)||pricingMoney(unit.lowWeekdayPrice)||regularWeekend||regularWeekday].filter(Boolean);
  if(season==='high')return [pricingMoney(unit.highWeekdayPrice)||regularWeekday,pricingMoney(unit.highWeekendPrice)||pricingMoney(unit.highWeekdayPrice)||regularWeekend||regularWeekday].filter(Boolean);
  return [regularWeekday,regularWeekend,holiday].filter(Boolean);
}
export function allSeasonalPriceCandidates(unit:DatePriceSource){return [
  pricingMoney(unit.lowWeekdayPrice),pricingMoney(unit.lowWeekendPrice),pricingMoney(unit.weekdayPrice),pricingMoney(unit.weekendPrice),pricingMoney(unit.highWeekdayPrice),pricingMoney(unit.highWeekendPrice),pricingMoney(unit.holidayPrice)
].filter(Boolean)}
