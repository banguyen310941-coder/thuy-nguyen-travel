export type PricingDayKind='weekday'|'weekend'|'holiday';
export type DatePriceSource={weekdayPrice?:string|number|null;weekendPrice?:string|number|null;holidayPrice?:string|number|null};

export const VIETNAM_FIXED_PRICING_HOLIDAYS=new Set(['01-01','04-30','05-01','09-02']);

export function pricingMoney(v?:string|number|null){if(typeof v==='number')return Number.isFinite(v)?Math.round(v):0;const d=String(v||'').replace(/\D/g,'');return d?Number(d):0}
export function pricingDateKey(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function parsePricingDate(value:string){const[y,m,d]=value.split('-').map(Number);return new Date(y,m-1,d,12)}
export function pricingDayKind(d:Date):PricingDayKind{const md=`${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;if(VIETNAM_FIXED_PRICING_HOLIDAYS.has(md))return'holiday';const day=d.getDay();return day===0||day===6?'weekend':'weekday'}
export function fallbackUnitPrice(unit:DatePriceSource,date:Date){const weekday=pricingMoney(unit.weekdayPrice),weekend=pricingMoney(unit.weekendPrice)||weekday,holiday=pricingMoney(unit.holidayPrice)||weekend||weekday;const kind=pricingDayKind(date);return kind==='holiday'?holiday:kind==='weekend'?weekend:weekday}
