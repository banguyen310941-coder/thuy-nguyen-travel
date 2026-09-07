'use client';

import Link from 'next/link';
import {useEffect,useState} from 'react';
import {canonicalPartnerProduct,type PartnerPublicProduct} from '@/components/PartnerPublicCatalog';
import {UnifiedStayPublicDetail} from '@/components/UnifiedStayPublicDetail';
import {UnifiedCruisePublicDetail} from '@/components/UnifiedCruisePublicDetail';
import {UnifiedTourPublicDetail} from '@/components/UnifiedTourPublicDetail';
import type {PricingBasis} from '@/components/ProductModel';
import {seedPublicCommerceRuntime} from '@/lib/public-commerce-runtime';
import type {PublicRateRange} from '@/lib/public-rate-utils';

type PublicGuestType='adult'|'child'|'all';
export type PublicProductUnit={id:string;code:string;name:string;bedrooms?:string;beds?:string;capacity:string;area:string;view:string;meal:string;weekdayPrice:string;weekendPrice:string;holidayPrice:string;lowWeekdayPrice?:string;lowWeekendPrice?:string;highWeekdayPrice?:string;highWeekendPrice?:string;extraAdult?:string;extraChild?:string;status:string;amenities?:string;images?:string;pricingBasis?:PricingBasis;guestType?:PublicGuestType};
export type PublicProduct={id:string;type:string;name:string;slug:string;place:string;price:string;pricingBasis?:PricingBasis;status:string;summary:string;cover:string;gallery:string;rating:string;category:string;serviceStars?:number|string;address:string;checkin:string;checkout:string;amenities:string;amenityTags?:string[];amenityDetails?:Record<string,string>;policies:string;childrenPolicy:string;extraCharge:string;extraPersonFee?:string;earlyCheckinFee?:string;lateCheckoutFee?:string;earlyLatePolicy?:string;duration:string;pickup:string;boarding:string;itinerary:string;content:string;seoTitle?:string;seoDescription?:string;units:PublicProductUnit[];unitsText?:string;departure?:string;route?:string;airline?:string;transport?:string;departures?:string;included?:string;excluded?:string;highlights?:string;promotions?:string};
const empty=(p:PartnerPublicProduct,price:string):PublicProduct=>{const canonical=canonicalPartnerProduct(p);return{...canonical,price:price||canonical.price,rating:String(p.rating||''),serviceStars:p.serviceStars,unitsText:p.unitsText||'',departure:p.departure,route:p.route||canonical.route||'',airline:p.airline,transport:p.transport,departures:p.departures,included:p.included,excluded:p.excluded,highlights:p.highlights,promotions:p.promotions} as PublicProduct};

export function CmsProductDetail({slug:explicitSlug,initialProduct,initialRates=[]}:{slug?:string;initialProduct?:PublicProduct|null;initialRates?:PublicRateRange[]}={}){
 const seed=initialProduct===null?undefined:initialProduct;
 const[product,setProduct]=useState<PublicProduct|null|undefined>(seed);
 const[rates,setRates]=useState<PublicRateRange[]>(initialRates);
 useEffect(()=>setProduct(initialProduct===null?undefined:initialProduct),[initialProduct]);
 useEffect(()=>setRates(initialRates),[initialRates]);
 useEffect(()=>{seedPublicCommerceRuntime(product,rates)},[product,rates]);
 useEffect(()=>{let alive=true;const slug=explicitSlug||new URLSearchParams(window.location.search).get('slug')||'';const set=(value:PublicProduct|null)=>{if(alive)setProduct(value)};const load=async()=>{try{const siteResponse=await fetch('/api/catalog/site-state',{cache:'no-store'});if(siteResponse.ok){const site=await siteResponse.json() as{state?:Record<string,unknown>};const state=site.state||{};const items=state.tn_cms_products_v3_units;const nextRates=state.tn_cms_daily_rates_v1;if(alive&&Array.isArray(nextRates))setRates(nextRates as PublicRateRange[]);if(Array.isArray(items)){const found=(items as PublicProduct[]).find(x=>x.slug===slug&&x.status==='published');if(found){set(found);return}}}const partnerResponse=await fetch('/api/catalog/partner-products',{cache:'no-store'});if(partnerResponse.ok){const data=await partnerResponse.json() as{products?:PartnerPublicProduct[]};const p=Array.isArray(data.products)?data.products.find(x=>x.slug===slug):undefined;if(p){set(empty(p,p.price||'Liên hệ'));return}}set(null)}catch{if(!initialProduct)set(null)}};void load();const refresh=()=>void load();window.addEventListener('tn-products-updated',refresh);window.addEventListener('tn-rates-updated',refresh);window.addEventListener('happygo-partner-products-updated',refresh);window.addEventListener('happygo-partner-rates-updated',refresh);return()=>{alive=false;window.removeEventListener('tn-products-updated',refresh);window.removeEventListener('tn-rates-updated',refresh);window.removeEventListener('happygo-partner-products-updated',refresh);window.removeEventListener('happygo-partner-rates-updated',refresh)}},[explicitSlug,initialProduct]);
 useEffect(()=>{if(!product)return;if(product.seoTitle)document.title=product.seoTitle;const desc=product.seoDescription||product.summary;if(desc){let meta=document.head.querySelector('meta[name="description"]') as HTMLMetaElement|null;if(!meta){meta=document.createElement('meta');meta.name='description';document.head.appendChild(meta)}meta.content=desc}},[product]);
 if(product===undefined)return <div className="sub-section white"><div className="container"><div className="article-state">Đang tải sản phẩm...</div></div></div>;
 if(!product)return <div className="sub-section white"><div className="container"><div className="article-state"><h2>Không tìm thấy sản phẩm</h2><p>Sản phẩm có thể đang ở bản nháp, chưa được duyệt hoặc đã ngừng bán.</p><Link href="/">← Quay lại trang chủ</Link></div></div></div>;
 if(product.type==='Villa & Resort'||product.type==='Khách sạn')return <UnifiedStayPublicDetail product={product} initialRates={rates}/>;
 if(product.type==='Du thuyền')return <UnifiedCruisePublicDetail product={product} initialRates={rates}/>;
 if(product.type==='Tour du lịch'||product.type==='Tour')return <UnifiedTourPublicDetail product={product}/>;
 return <div className="sub-section white"><div className="container"><div className="article-state"><h2>{product.name}</h2><p>Loại sản phẩm này đang được cập nhật giao diện.</p></div></div></div>;
}
