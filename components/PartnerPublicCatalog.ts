'use client';

export type PartnerPublicProduct={id:string;partnerId:string;partnerName:string;type:'Villa & Resort'|'Khách sạn'|'Du thuyền'|'Tour du lịch';name:string;slug:string;place:string;address:string;price:string;summary:string;cover:string;gallery:string;amenities:string;policies:string;checkin:string;checkout:string;unitsText:string;status:string;updatedAt:string;category?:string;duration?:string;boarding?:string;departure?:string;route?:string;airline?:string;transport?:string;departures?:string;itinerary?:string;highlights?:string;included?:string;excluded?:string;promotions?:string;childrenPolicy?:string;extraCharge?:string;content?:string;faq?:string};
export type PartnerPublicPricing={productId:string;commission:string;agencyPrice:string;retailPrice:string;promoPrice:string;rules?:{date:string;agencyPrice:string;retailPrice:string;promoPrice:string;quantity:string;note:string}[]};
export const PARTNER_PRODUCTS_KEY='happygo_partner_products_v1';
export const PARTNER_PRICING_KEY='happygo_partner_pricing_v1';
export function readPartnerPublic(){try{const products=JSON.parse(localStorage.getItem(PARTNER_PRODUCTS_KEY)||'[]') as PartnerPublicProduct[];const pricing=JSON.parse(localStorage.getItem(PARTNER_PRICING_KEY)||'[]') as PartnerPublicPricing[];return{products:Array.isArray(products)?products.filter(x=>x.status==='approved'):[],pricing:Array.isArray(pricing)?pricing:[]}}catch{return{products:[],pricing:[]}}}
export function partnerPublicPrice(product:PartnerPublicProduct,pricing:PartnerPublicPricing[]){const p=pricing.find(x=>x.productId===product.id);return p?.promoPrice||p?.retailPrice||product.price||'Liên hệ'}
export function partnerLines(v?:string){return String(v||'').split(/\n+/).map(x=>x.trim()).filter(Boolean)}
