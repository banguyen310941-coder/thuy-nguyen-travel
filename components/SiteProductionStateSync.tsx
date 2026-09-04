'use client';

import {useEffect} from 'react';

const EVENTS:Record<string,string>={
 'tn_cms_products_v3_units':'tn-products-updated',
 'tn_cms_daily_rates_v1':'tn-rates-updated',
 'tn_cms_tours_v3':'tn-tours-updated',
 'tn_cms_articles_v3':'tn-articles-updated',
 'tn_cms_homepage':'tn-homepage-updated',
};

export function SiteProductionStateSync(){
 useEffect(()=>{
  let alive=true;
  async function sync(){
   try{
    const response=await fetch('/api/catalog/site-state',{cache:'no-store'});if(!response.ok)return;
    const data=await response.json() as {state?:Record<string,unknown>};if(!alive||!data.state)return;
    Object.entries(data.state).forEach(([key,value])=>{
     const serialized=JSON.stringify(value??null);
     if(localStorage.getItem(key)!==serialized){localStorage.setItem(key,serialized);const event=EVENTS[key];if(event)window.dispatchEvent(new Event(event))}
    });
   }catch{}
  }
  void sync();
  const timer=window.setInterval(sync,60000);
  const focus=()=>void sync();window.addEventListener('focus',focus);
  return()=>{alive=false;window.clearInterval(timer);window.removeEventListener('focus',focus)};
 },[]);
 return null;
}
