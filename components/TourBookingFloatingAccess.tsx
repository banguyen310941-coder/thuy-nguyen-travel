'use client';

import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';

const TARGET_SELECTOR='.tour-rich-page .tour-booking-sticky, .product-detail-v2 #booking';

function isTourTarget(pathname:string,target:Element|null){
 if(!target)return false;
 if(target.closest('.tour-rich-page'))return true;
 if(pathname.startsWith('/tours/')||pathname.startsWith('/tour-product'))return true;
 if(pathname.startsWith('/product/')){
  const label=document.querySelector('.product-detail-v2 .pd-price-card small')?.textContent||'';
  return /tour/i.test(label);
 }
 return false;
}

export function TourBookingFloatingAccess(){
 const pathname=usePathname();
 const[visible,setVisible]=useState(false);
 useEffect(()=>{
  const sync=()=>setVisible(isTourTarget(pathname,document.querySelector(TARGET_SELECTOR)));
  sync();
  const observer=new MutationObserver(sync);
  observer.observe(document.body,{childList:true,subtree:true});
  return()=>observer.disconnect();
 },[pathname]);
 if(!visible)return null;
 return <button type="button" className="tour-mobile-booking-access" onClick={()=>{
  const target=document.querySelector(TARGET_SELECTOR) as HTMLElement|null;
  if(!target)return;
  target.scrollIntoView({behavior:'smooth',block:'start'});
 }} aria-label="Đi đến form đặt tour và giữ chỗ"><span>Đặt tour</span><b>Giữ chỗ ngay</b></button>;
}
