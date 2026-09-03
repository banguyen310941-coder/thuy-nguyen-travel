'use client';

import {useEffect} from 'react';
import {normalizePartnerProduct,PRODUCT_STORAGE_KEY} from '@/components/ProductModel';

export function ApprovedPartnerCatalogSync(){
  useEffect(()=>{
    let cancelled=false;
    async function sync(){
      try{
        const response=await fetch('/api/catalog/partner-products',{cache:'no-store'});
        if(!response.ok)return;
        const data=await response.json();
        const remote=Array.isArray(data?.products)?data.products:[];
        const currentRaw=JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY)||'[]');
        const current=Array.isArray(currentRaw)?currentRaw:[];
        const adminProducts=current.filter((item:any)=>item?.source!=='partner');
        const partnerProducts=remote.map((item:any)=>normalizePartnerProduct({...item,status:'approved'}));
        const next=[...adminProducts,...partnerProducts];
        if(cancelled)return;
        if(JSON.stringify(current)!==JSON.stringify(next)){
          localStorage.setItem(PRODUCT_STORAGE_KEY,JSON.stringify(next));
          window.dispatchEvent(new Event('tn-products-updated'));
        }
      }catch{}
    }
    void sync();
    const timer=window.setInterval(sync,60000);
    return()=>{cancelled=true;window.clearInterval(timer)};
  },[]);
  return null;
}
