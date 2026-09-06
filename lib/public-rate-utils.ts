import {pricingDayKind,pricingMoney} from '@/lib/pricing-calendar';

export type PublicRateStatus='available'|'hold'|'soldout';
export type PublicRateSeason='low'|'regular'|'high'|'holiday'|'custom';
export type PublicRateRange={
 id:string;
 productId?:string;
 unitId:string;
 start:string;
 end:string;
 price:string;
 oldPrice?:string;
 quantity:string;
 minStay:string;
 status:PublicRateStatus;
 note:string;
 season?:PublicRateSeason;
 weekdayPrice?:string;
 weekendPrice?:string;
 sundayPrice?:string;
 holidayPrice?:string;
};

export function ratesForUnit(rates:PublicRateRange[],unitId:string){return rates.filter(rate=>rate.unitId===unitId)}
export function rateForDate(rates:PublicRateRange[],unitId:string,date:string){const matches=ratesForUnit(rates,unitId).filter(rate=>rate.start&&rate.end&&date>=rate.start&&date<=rate.end);return matches.length?matches[matches.length-1]:null}
export function ratePriceCandidates(rate:PublicRateRange){return[rate.weekdayPrice,rate.weekendPrice,rate.sundayPrice,rate.holidayPrice,rate.price].map(pricingMoney).filter(Boolean)}
export function ratePriceForDate(rate:PublicRateRange,date:Date){
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
