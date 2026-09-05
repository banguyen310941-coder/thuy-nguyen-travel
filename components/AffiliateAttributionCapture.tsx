'use client';
import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';

const safeDecode=(value:string)=>{try{return decodeURIComponent(value)}catch{return value}};

export function AffiliateAttributionCapture(){
 const pathname=usePathname();
 const inFlight=useRef(new Set<string>());
 useEffect(()=>{
  const params=new URLSearchParams(window.location.search);
  const code=String(params.get('ref')||'').trim().toUpperCase(),villaId=String(params.get('villa_id')||'').trim();
  const parts=pathname.split('/').filter(Boolean);
  const pathSlug=(parts[0]==='san-pham'||parts[0]==='product')&&parts[1]?safeDecode(parts[1]):'';
  const slug=pathSlug||String(params.get('slug')||'').trim();
  if(!code||!villaId||!slug)return;
  const key=`${code}:${villaId}:${slug}`;
  try{if(sessionStorage.getItem(`happygo-affiliate-track:${key}`))return}catch{}
  if(inFlight.current.has(key))return;
  inFlight.current.add(key);
  void fetch('/api/affiliate/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,villaId,slug})}).then(response=>{
   if(!response.ok)throw new Error('affiliate_track_rejected');
   try{sessionStorage.setItem(`happygo-affiliate-track:${key}`,'1')}catch{}
   params.delete('ref');params.delete('villa_id');
   const query=params.toString();
   window.history.replaceState(window.history.state,'',`${window.location.pathname}${query?`?${query}`:''}${window.location.hash}`);
  }).catch(()=>{}).finally(()=>{inFlight.current.delete(key)});
 },[pathname]);
 return null;
}
