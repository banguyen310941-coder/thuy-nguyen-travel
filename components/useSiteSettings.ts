'use client';

import {useEffect,useState} from 'react';

export type SiteSettings={brand:string;hotline:string;email:string;zalo:string};
export const defaultSiteSettings:SiteSettings={brand:'HappyGo Travel',hotline:'0969973949',email:'info@happygo.vn',zalo:'0969973949'};
const key='tn_cms_site_settings_v1';

function migrateBrand(value:Partial<SiteSettings>|null|undefined):SiteSettings{
 const current={...defaultSiteSettings,...(value||{})};
 if(!current.brand||/th[uú]y\s*nguy[eê]n/i.test(current.brand))current.brand='HappyGo Travel';
 if(!current.email||/thuynguyen/i.test(current.email))current.email='info@happygo.vn';
 return current;
}

export function useSiteSettings(){
 const [settings,setSettings]=useState<SiteSettings>(defaultSiteSettings);
 useEffect(()=>{
  const load=()=>{try{const raw=localStorage.getItem(key);const next=migrateBrand(raw?JSON.parse(raw):null);setSettings(next);if(raw){const before=JSON.stringify(JSON.parse(raw));const after=JSON.stringify(next);if(before!==after){localStorage.setItem(key,after);window.dispatchEvent(new Event('tn-site-settings-updated'))}}}catch{setSettings(defaultSiteSettings)}};
  load();
  window.addEventListener('tn-site-settings-updated',load);
  window.addEventListener('storage',load);
  return()=>{window.removeEventListener('tn-site-settings-updated',load);window.removeEventListener('storage',load)};
 },[]);
 return settings;
}

export function formatPhone(v:string){const d=v.replace(/\D/g,'');return d.length===10?`${d.slice(0,4)} ${d.slice(4,7)} ${d.slice(7)}`:v}
