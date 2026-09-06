'use client';

import {useEffect,useState} from 'react';

export type SiteSettings={brand:string;hotline:string;email:string;zalo:string;facebookUrl:string;youtubeUrl:string;tiktokUrl:string};
export const defaultSiteSettings:SiteSettings={brand:'HappyGo Travel',hotline:'0969973949',email:'info@happygo.vn',zalo:'0969973949',facebookUrl:'',youtubeUrl:'',tiktokUrl:''};

export function normalizeSiteSettings(value:Partial<SiteSettings>|null|undefined):SiteSettings{
 const current={...defaultSiteSettings,...(value||{})};
 if(!current.brand||/th[uú]y\s*nguy[eê]n/i.test(current.brand))current.brand='HappyGo Travel';
 if(!current.email||/thuynguyen/i.test(current.email))current.email='info@happygo.vn';
 return current;
}

export function useSiteSettings(initialSettings:Partial<SiteSettings>|null=defaultSiteSettings){
 const[settings,setSettings]=useState<SiteSettings>(()=>normalizeSiteSettings(initialSettings));
 useEffect(()=>setSettings(normalizeSiteSettings(initialSettings)),[initialSettings]);
 useEffect(()=>{
  let alive=true;
  const loadServer=async()=>{try{const response=await fetch('/api/site-config',{cache:'no-store'});const json=await response.json();if(!response.ok||!json.site||!alive)return;setSettings(normalizeSiteSettings(json.site))}catch{}};
  void loadServer();
  const refresh=()=>void loadServer();
  window.addEventListener('tn-site-settings-updated',refresh);
  window.addEventListener('focus',refresh);
  return()=>{alive=false;window.removeEventListener('tn-site-settings-updated',refresh);window.removeEventListener('focus',refresh)};
 },[]);
 return settings;
}

export function formatPhone(v:string){const d=v.replace(/\D/g,'');return d.length===10?`${d.slice(0,4)} ${d.slice(4,7)} ${d.slice(7)}`:v}
