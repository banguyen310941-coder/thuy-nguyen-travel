'use client';

import {useEffect} from 'react';

const ACCOUNTS='happygo_partner_accounts_v1';
const PROFILE='happygo_partner_profile_v1';
const PRODUCTS='happygo_partner_products_v1';
const PRICING='happygo_partner_pricing_v1';
const SESSION='happygo_partner_session_v1';
const DEMO_ID='pt_happygo_demo';
const DEMO_EMAIL='demo@happygo.vn';
const DEMO_PRODUCT_IDS=new Set(['partner_demo_resort','partner_demo_villa','partner_standard_villa_review_2026']);
const DEMO_PRODUCT_SLUGS=new Set(['happygo-demo-beach-resort-nha-trang','happygo-demo-garden-villa','sunrise-ocean-pool-villa-3pn']);

function read(key:string){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}catch{return[]}}
function write(key:string,value:unknown){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function purgeDemo(){
 write(ACCOUNTS,read(ACCOUNTS).filter((x:any)=>String(x?.id||'')!==DEMO_ID&&String(x?.email||'').trim().toLowerCase()!==DEMO_EMAIL));
 write(PRODUCTS,read(PRODUCTS).filter((x:any)=>!DEMO_PRODUCT_IDS.has(String(x?.id||''))&&!DEMO_PRODUCT_SLUGS.has(String(x?.slug||''))&&String(x?.partnerId||'')!==DEMO_ID));
 write(PRICING,read(PRICING).filter((x:any)=>!DEMO_PRODUCT_IDS.has(String(x?.productId||''))));
 localStorage.removeItem(`${PROFILE}_${DEMO_ID}`);
 if(localStorage.getItem(SESSION)===DEMO_ID)localStorage.removeItem(SESSION);
 window.dispatchEvent(new Event('happygo-partner-products-updated'));
 window.dispatchEvent(new Event('happygo-partner-rates-updated'));
}

/** Legacy compatibility mount. Demo creation has been permanently removed. */
export function PartnerDemoSeeder(){useEffect(()=>{purgeDemo()},[]);return null}
