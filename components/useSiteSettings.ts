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
  let alive=true;
  const loadLocal=()=>{try{const raw=localStorage.getItem(key);const next=migrateBrand(raw?JSON.parse(raw):null);if(alive)setSettings(next)}catch{if(alive)setSettings(defaultSiteSettings)}};
  const loadServer=async()=>{try{const response=await fetch('/api/site-config',{cache:'no-store'});const json=await response.json();if(!response.ok||!json.site||!alive)return;const next=migrateBrand(json.site);localStorage.setItem(key,JSON.stringify(next));setSettings(next);window.dispatchEvent(new Event('tn-site-settings-updated'))}catch{}};
  loadLocal();void loadServer();
  const refresh=()=>{loadLocal();void loadServer()};
  window.addEventListener('tn-site-settings-updated',loadLocal);
  window.addEventListener('storage',loadLocal);
  window.addEventListener('focus',refresh);
  return()=>{alive=false;window.removeEventListener('tn-site-settings-updated',loadLocal);window.removeEventListener('storage',loadLocal);window.removeEventListener('focus',refresh)};
 },[]);
 return settings;
}

export function formatPhone(v:string){const d=v.replace(/\D/g,'');return d.length===10?`${d.slice(0,4)} ${d.slice(4,7)} ${d.slice(7)}`:v}
