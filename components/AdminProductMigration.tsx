'use client';

import {useEffect} from 'react';

type LegacyProduct={
  id?:string;type?:string;name?:string;slug?:string;place?:string;price?:string;salePrice?:string;
  status?:string;summary?:string;cover?:string;gallery?:string;rating?:string;category?:string;
  duration?:string;address?:string;checkin?:string;checkout?:string;roomTypes?:string;cabins?:string;
  itinerary?:string;amenities?:string;policies?:string;childrenPolicy?:string;extraCharge?:string;
  pickup?:string;boarding?:string;content?:string;seoTitle?:string;seoDescription?:string;updatedAt?:string;
};

type CurrentProduct={RecordKey:string}&Record<string,unknown>;

const LEGACY_KEY='tn_cms_products_v2';
const PRODUCT_KEY='tn_cms_products_v3_units';
const TOUR_KEY='tn_cms_tours_v3';
const MIGRATION_KEY='tn_cms_migrated_products_v2_to_v3';

const slugify=(v:string)=>v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

function safeArray<T>(raw:string|null):T[]{
  if(!raw)return [];
  try{const value=JSON.parse(raw);return Array.isArray(value)?value:[]}catch{return []}
}

function statusOf(v?:string){return v==='hidden'?'hidden':v==='draft'?'draft':'published'}

export function AdminProductMigration(){
  useEffect(()=>{
    try{
      if(localStorage.getItem(MIGRATION_KEY)==='1')return;
      const legacy=safeArray<LegacyProduct>(localStorage.getItem(LEGACY_KEY));
      if(!legacy.length){localStorage.setItem(MIGRATION_KEY,'1');return;}

      const current=safeArray<Record<string,unknown>>(localStorage.getItem(PRODUCT_KEY));
      const currentTours=safeArray<Record<string,unknown>>(localStorage.getItem(TOUR_KEY));
      const existingProductKeys=new Set(current.map(x=>String(x.slug||x.id||'')));
      const existingTourKeys=new Set(currentTours.map(x=>String(x.slug||x.id||'')));

      const migratedProducts=legacy
        .filter(x=>x.type==='Villa & Resort'||x.type==='Khách sạn'||x.type==='Du thuyền')
        .filter(x=>!existingProductKeys.has(String(x.slug||x.id||'')))
        .map(x=>({
          id:x.id||`p_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
          type:x.type,
          name:x.name||'Sản phẩm chưa đặt tên',
          slug:x.slug||slugify(x.name||'san-pham'),
          place:x.place||'',
          price:x.salePrice||x.price||'',
          status:statusOf(x.status),
          summary:x.summary||'',
          cover:x.cover||'',
          gallery:x.gallery||'',
          rating:x.rating||'',
          category:x.category||'',
          address:x.address||'',
          checkin:x.checkin||'14:00',
          checkout:x.checkout||'12:00',
          amenities:x.amenities||'',
          policies:x.policies||'',
          childrenPolicy:x.childrenPolicy||'',
          extraCharge:x.extraCharge||'',
          duration:x.duration||'',
          pickup:x.pickup||'',
          boarding:x.boarding||'',
          itinerary:x.itinerary||'',
          content:x.content||'',
          seoTitle:x.seoTitle||'',
          seoDescription:x.seoDescription||'',
          units:[],
          updatedAt:x.updatedAt||new Date().toISOString(),
        }));

      const migratedTours=legacy
        .filter(x=>x.type==='Tour du lịch')
        .filter(x=>!existingTourKeys.has(String(x.slug||x.id||'')))
        .map(x=>({
          id:x.id||`tour_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
          name:x.name||'Tour chưa đặt tên',
          cover:x.cover||'',
          category:x.category||'Tour trong nước',
          duration:x.duration||'',
          departure:'Hà Nội',
          airline:'',
          route:x.place||'',
          transport:'Máy bay, Ô tô',
          summary:x.summary||'',
          status:statusOf(x.status),
          price:x.price||'',
          salePrice:x.salePrice||x.price||'',
          childPrice:'',singleCharge:'',departures:'',gallery:x.gallery||'',highlights:'',
          itinerary:x.itinerary||'',days:[],included:'',excluded:'',policies:x.policies||'',promotion:'',
          rating:x.rating||'',reviewCount:'',faq:'',seoTitle:x.seoTitle||'',seoDescription:x.seoDescription||'',
          slug:x.slug||slugify(x.name||'tour'),
        }));

      if(migratedProducts.length){
        localStorage.setItem(PRODUCT_KEY,JSON.stringify([...current,...migratedProducts]));
        window.dispatchEvent(new Event('tn-products-updated'));
      }
      if(migratedTours.length){
        localStorage.setItem(TOUR_KEY,JSON.stringify([...currentTours,...migratedTours]));
        window.dispatchEvent(new Event('tn-tours-updated'));
      }
      localStorage.setItem(MIGRATION_KEY,'1');
    }catch(error){
      console.error('Product migration failed',error);
    }
  },[]);
  return null;
}
