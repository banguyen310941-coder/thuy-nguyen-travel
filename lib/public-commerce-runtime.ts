import {parsePricingDate,pricingMoney,seasonalUnitPrice} from '@/lib/pricing-calendar';
import {rateForDate,ratePriceForDate,type PublicRateRange} from '@/lib/public-rate-utils';
import type {PricingBasis} from '@/components/ProductModel';

type RuntimeUnit={id:string;pricingBasis?:PricingBasis;weekdayPrice?:string;weekendPrice?:string;holidayPrice?:string;lowWeekdayPrice?:string;lowWeekendPrice?:string;highWeekdayPrice?:string;highWeekendPrice?:string;highSeasonRanges?:string;lowSeasonRanges?:string};
type RuntimeProduct={id?:string;slug?:string;price?:string;pricingBasis?:PricingBasis;units?:RuntimeUnit[]};
type RuntimeEntry={product:RuntimeProduct;rates:PublicRateRange[]};
export type PublicCommerceRuntimeSnapshot={sellingPrice:number;availableQuantity:number|null;isAvailable:boolean;pricingBasis?:PricingBasis;sellingSource:'unit_calendar'|'unit_base'|'product'|'unknown';inventorySource:'unit_calendar'|'unknown';sourceLabel:string};

const byId=new Map<string,RuntimeEntry>();
const bySlug=new Map<string,RuntimeEntry>();
const qty=(value?:string|number|null)=>{if(value==null||String(value).trim()==='')return null;const n=Number(String(value).replace(/[^0-9-]/g,''));return Number.isFinite(n)?Math.max(0,Math.floor(n)):null};

export function seedPublicCommerceRuntime(product:RuntimeProduct|null|undefined,rates:PublicRateRange[]=[]){
 if(!product)return;const entry={product,rates:Array.isArray(rates)?rates:[]};if(product.id)byId.set(product.id,entry);if(product.slug)bySlug.set(product.slug,entry);
}

export function resolvePublicCommerceRuntime(input:{productId?:string;productSlug?:string;unitId?:string;date?:string}):PublicCommerceRuntimeSnapshot|null{
 const entry=(input.productId?byId.get(input.productId):undefined)||(input.productSlug?bySlug.get(input.productSlug):undefined);if(!entry)return null;
 const product=entry.product;const unit=input.unitId?(product.units||[]).find(item=>item.id===input.unitId):undefined;if(input.unitId&&!unit)return null;
 const pricingBasis=unit?.pricingBasis||product.pricingBasis;
 if(unit&&input.date){
  const rate=rateForDate(entry.rates,unit.id,input.date);
  if(rate){const availableQuantity=qty(rate.quantity),isAvailable=rate.status==='available'&&(availableQuantity===null||availableQuantity>0),sellingPrice=isAvailable?ratePriceForDate(rate,parsePricingDate(input.date)):0;return{sellingPrice,availableQuantity,isAvailable,pricingBasis,sellingSource:'unit_calendar',inventorySource:'unit_calendar',sourceLabel:`Lịch giá production ${input.date}`}}
  const base=seasonalUnitPrice(unit,parsePricingDate(input.date));if(base)return{sellingPrice:base,availableQuantity:null,isAvailable:true,pricingBasis,sellingSource:'unit_base',inventorySource:'unknown',sourceLabel:'Giá cấu hình đúng hạng'};
 }
 const productPrice=pricingMoney(product.price);if(productPrice)return{sellingPrice:productPrice,availableQuantity:null,isAvailable:true,pricingBasis,sellingSource:'product',inventorySource:'unknown',sourceLabel:'Giá sản phẩm production'};
 return{sellingPrice:0,availableQuantity:null,isAvailable:true,pricingBasis,sellingSource:'unknown',inventorySource:'unknown',sourceLabel:'Chưa có nguồn giá'};
}
