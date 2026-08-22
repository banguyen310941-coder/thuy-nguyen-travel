'use client';

import {useEffect,useState} from 'react';

export type SiteSettings={brand:string;hotline:string;email:string;zalo:string};
export const defaultSiteSettings:SiteSettings={brand:'Thúy Nguyên Travel',hotline:'0969973949',email:'info@thuynguyentravel.com',zalo:'0969973949'};
const key='tn_cms_site_settings_v1';

export function useSiteSettings(){
 const [settings,setSettings]=useState<SiteSettings>(defaultSiteSettings);
 useEffect(()=>{
  const load=()=>{try{const raw=localStorage.getItem(key);setSettings(raw?{...defaultSiteSettings,...JSON.parse(raw)}:defaultSiteSettings)}catch{setSettings(defaultSiteSettings)}};
  load();
  window.addEventListener('tn-site-settings-updated',load);
  window.addEventListener('storage',load);
  return()=>{window.removeEventListener('tn-site-settings-updated',load);window.removeEventListener('storage',load)};
 },[]);
 return settings;
}

export function formatPhone(v:string){const d=v.replace(/\D/g,'');return d.length===10?`${d.slice(0,4)} ${d.slice(4,7)} ${d.slice(7)}`:v}
