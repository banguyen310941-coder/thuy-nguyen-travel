'use client';

import {useEffect} from 'react';

const CLEANUP_MARK='happygo_demo_cleanup_20260905_v1';
const TOUR_KEY='tn_cms_tours_v3';
const ARTICLE_V3='tn_cms_articles_v3';
const ARTICLE_V4='tn_cms_articles_v4';
const PARTNER_ACCOUNTS='happygo_partner_accounts_v1';
const PARTNER_PRODUCTS='happygo_partner_products_v1';
const PARTNER_PRICING='happygo_partner_pricing_v1';
const PARTNER_PROFILE='happygo_partner_profile_v1';
const PARTNER_SESSION='happygo_partner_session_v1';
const DEMO_PARTNER_ID='pt_happygo_demo';
const DEMO_EMAIL='demo@happygo.vn';
const DEMO_PRODUCT_IDS=new Set(['partner_demo_resort','partner_demo_villa','partner_standard_villa_review_2026']);
const DEMO_PRODUCT_SLUGS=new Set(['happygo-demo-beach-resort-nha-trang','happygo-demo-garden-villa','sunrise-ocean-pool-villa-3pn']);

function array(key:string){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}catch{return[]}}
function save(key:string,value:unknown){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}

export function DemoTourSchedules(){
 useEffect(()=>{
  try{
   if(localStorage.getItem(CLEANUP_MARK)==='done')return;

   // The old tour catalogue was sample content only. Production currently owns this state.
   save(TOUR_KEY,[]);

   // v3 was exclusively used by the retired SEO demo seeder.
   save(ARTICLE_V3,[]);

   // Keep only the five current SEO guide mirrors. Remove legacy/manual sample articles left in browser storage.
   const articlesV4=array(ARTICLE_V4).filter((item:any)=>String(item?.id||'').startsWith('seo_'));
   save(ARTICLE_V4,articlesV4);

   const accounts=array(PARTNER_ACCOUNTS).filter((item:any)=>String(item?.id||'')!==DEMO_PARTNER_ID&&String(item?.email||'').trim().toLowerCase()!==DEMO_EMAIL);
   save(PARTNER_ACCOUNTS,accounts);
   const products=array(PARTNER_PRODUCTS).filter((item:any)=>!DEMO_PRODUCT_IDS.has(String(item?.id||''))&&!DEMO_PRODUCT_SLUGS.has(String(item?.slug||''))&&String(item?.partnerId||'')!==DEMO_PARTNER_ID);
   save(PARTNER_PRODUCTS,products);
   const pricing=array(PARTNER_PRICING).filter((item:any)=>!DEMO_PRODUCT_IDS.has(String(item?.productId||'')));
   save(PARTNER_PRICING,pricing);
   localStorage.removeItem(`${PARTNER_PROFILE}_${DEMO_PARTNER_ID}`);
   if(localStorage.getItem(PARTNER_SESSION)===DEMO_PARTNER_ID)localStorage.removeItem(PARTNER_SESSION);

   localStorage.setItem(CLEANUP_MARK,'done');
   window.dispatchEvent(new Event('tn-tours-updated'));
   window.dispatchEvent(new Event('tn-articles-updated'));
   window.dispatchEvent(new Event('happygo-partner-products-updated'));
   window.dispatchEvent(new Event('happygo-partner-rates-updated'));
  }catch{}
 },[]);
 return null;
}
