'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {resolveCommerce} from '@/components/ProductCommerce';
import {defaultPricingBasis,type PricingBasis,type ProductType} from '@/components/ProductModel';
import {inventoryAllowsStay,resolveInventory} from '@/components/ProductInventory';
import {findBookingUnit} from '@/lib/booking-unit-selection';
import {getPublicCommerceRuntimeEntry,resolvePublicCommerceRuntime,type PublicCommerceRuntimeSnapshot} from '@/lib/public-commerce-runtime';

export type GuestType='adult'|'child'|'all';
export type CartItem={id:string;kind:string;product:string;productId?:string;productSlug?:string;unit?:string;unitId?:string;startDate?:string;endDate?:string;adults:number;children:number;rooms:number;pricingBasis?:PricingBasis;guestType?:GuestType;explicitQuantity?:number;priceLabel?:string;sellingPrice?:number;costPrice?:number|null;availableQuantity?:number|null;inventorySource?:string;inventoryStatus?:string;minStay?:number;sellingSource?:string;costSource?:string;priceSourceLabel?:string;priceCalculatedAt?:string;createdAt:string};
type StoredUnit={id?:string;code?:string;name?:string;pricingBasis?:PricingBasis};
type StoredProduct={id?:string;slug?:string;name?:string;pricingBasis?:PricingBasis;units?:StoredUnit[]};
type StoredRate={unitId:string;start:string;end:string;price?:string;quantity?:string;status?:string;[key:string]:unknown};

const KEY='tn_booking_cart_v1',PRODUCTS_KEY='tn_cms_products_v3_units',RATES_KEY='tn_cms_daily_rates_v1';
export function readCart():CartItem[]{try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
export function writeCart(items:CartItem[]){localStorage.setItem(KEY,JSON.stringify(items));window.dispatchEvent(new Event('tn-cart-updated'))}

function storedBasis(item:Omit<CartItem,'id'|'createdAt'>):PricingBasis|undefined{try{const all=JSON.parse(localStorage.getItem(PRODUCTS_KEY)||'[]') as StoredProduct[];const products=Array.isArray(all)?all:[];const p=products.find(x=>item.productId&&x.id===item.productId)||products.find(x=>item.productSlug&&x.slug===item.productSlug)||products.find(x=>x.name===item.product);if(!p)return;const u=findBookingUnit(p.units,{unitId:item.unitId,unit:item.unit});return u?.pricingBasis||p.pricingBasis}catch{return undefined}}
function basisFor(item:Omit<CartItem,'id'|'createdAt'>):PricingBasis{if(item.pricingBasis)return item.pricingBasis;const runtime=resolvePublicCommerceRuntime({productId:item.productId,productSlug:item.productSlug,unitId:item.unitId,date:item.startDate});if(runtime?.pricingBasis)return runtime.pricingBasis;const stored=storedBasis(item);if(stored)return stored;const k=String(item.kind||'').toLowerCase();const type:ProductType=k.includes('tour')?'Tour':k.includes('du thuyền')||k.includes('cruise')?'Du thuyền':k.includes('villa')||k.includes('resort')?'Villa & Resort':'Khách sạn';return defaultPricingBasis(type)}
function guestQuantity(item:Pick<CartItem,'adults'|'children'|'guestType'|'explicitQuantity'>){if(Number(item.explicitQuantity)>0)return Math.max(1,Math.floor(Number(item.explicitQuantity)));if(item.guestType==='adult')return Math.max(1,item.adults||0);if(item.guestType==='child')return Math.max(1,item.children||0);return Math.max(1,(item.adults||0)+(item.children||0))}
export function cartItemQuantity(item:Pick<CartItem,'adults'|'children'|'rooms'|'guestType'|'explicitQuantity'|'pricingBasis'>,nights=1){if(item.pricingBasis==='guest')return guestQuantity(item);if(item.pricingBasis==='package')return Math.max(1,Number(item.explicitQuantity)||item.rooms||1);return Math.max(1,nights)*Math.max(1,item.rooms||1)}

function persistRuntimeForCheckout(item:Omit<CartItem,'id'|'createdAt'>,runtime:PublicCommerceRuntimeSnapshot|null){
 const entry=getPublicCommerceRuntimeEntry({productId:item.productId,productSlug:item.productSlug});if(!entry)return;
 try{
  const oldProducts=JSON.parse(localStorage.getItem(PRODUCTS_KEY)||'[]') as StoredProduct[];
  const products=Array.isArray(oldProducts)?oldProducts:[];
  const nextProducts=products.filter(p=>!((entry.product.id&&p.id===entry.product.id)||(entry.product.slug&&p.slug===entry.product.slug)));
  localStorage.setItem(PRODUCTS_KEY,JSON.stringify([...nextProducts,entry.product]));
  const oldRates=JSON.parse(localStorage.getItem(RATES_KEY)||'[]') as StoredRate[];
  const merged=new Map<string,StoredRate>();
  const key=(r:Pick<StoredRate,'unitId'|'start'|'end'>)=>`${r.unitId}|${r.start}|${r.end}`;
  for(const rate of Array.isArray(oldRates)?oldRates:[])if(rate?.unitId&&rate.start&&rate.end)merged.set(key(rate),rate);
  for(const rate of entry.rates)merged.set(key(rate),rate as StoredRate);
  const isCruise=String(item.kind||'').toLowerCase().includes('du thuyền')||String(item.kind||'').toLowerCase().includes('cruise');
  if(isCruise&&runtime&&item.unitId&&item.startDate&&runtime.sellingPrice>0){
   const exact:StoredRate={unitId:item.unitId,start:item.startDate,end:item.startDate,price:String(runtime.sellingPrice),quantity:String(runtime.availableQuantity??999999),status:runtime.isAvailable?'available':'soldout',note:'Cart snapshot từ lịch giá production'};
   merged.set(key(exact),exact);
  }
  localStorage.setItem(RATES_KEY,JSON.stringify([...merged.values()]));
 }catch{}
}

export function addCartItem(item:Omit<CartItem,'id'|'createdAt'>){
 const runtime=resolvePublicCommerceRuntime({productId:item.productId,productSlug:item.productSlug,unitId:item.unitId,date:item.startDate});
 const snapshot=resolveCommerce({productId:item.productId,unitId:item.unitId,date:item.startDate,manualSelling:item.sellingPrice||item.priceLabel,manualCost:item.costPrice??undefined});
 const pricingBasis=item.pricingBasis||runtime?.pricingBasis||basisFor(item);
 const requested=pricingBasis==='guest'?guestQuantity(item):Math.max(1,Number(item.explicitQuantity)||item.rooms||1);
 const inventory=resolveInventory({productId:item.productId,unitId:item.unitId,date:item.startDate});
 if(!snapshot.isAvailable||!inventoryAllowsStay({productId:item.productId,unitId:item.unitId,startDate:item.startDate,endDate:item.endDate,pricingBasis,quantity:requested}))return null;
 const items=readCart();
 const next:CartItem={...item,pricingBasis,sellingPrice:snapshot.sellingPrice||item.sellingPrice||undefined,costPrice:item.costPrice??snapshot.costPrice,availableQuantity:item.availableQuantity??snapshot.availableQuantity??inventory.remaining,inventorySource:item.inventorySource||snapshot.inventorySource||inventory.source,inventoryStatus:inventory.status,minStay:inventory.minStay,sellingSource:snapshot.sellingSource||item.sellingSource,costSource:snapshot.costSource||item.costSource,priceSourceLabel:snapshot.sourceLabel||item.priceSourceLabel,priceCalculatedAt:new Date().toISOString(),id:`cart_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,createdAt:new Date().toISOString()};
 persistRuntimeForCheckout(item,runtime);
 writeCart([...items,next]);return next;
}

export function BookingCartBadge(){const[count,setCount]=useState(0);useEffect(()=>{const load=()=>setCount(readCart().length);load();window.addEventListener('tn-cart-updated',load);window.addEventListener('storage',load);return()=>{window.removeEventListener('tn-cart-updated',load);window.removeEventListener('storage',load)}},[]);return <Link className="booking-cart-badge" href="/thanh-toan" aria-label={`Giỏ đặt dịch vụ có ${count} mục`}><span>🧳</span><b>Đặt dịch vụ</b>{count>0&&<em>{count}</em>}</Link>}
