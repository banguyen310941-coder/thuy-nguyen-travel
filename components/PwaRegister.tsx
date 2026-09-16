'use client';
import {useEffect} from 'react';

export function PwaRegister(){
  useEffect(()=>{
    if(!('serviceWorker' in navigator))return;
    let live=true;
    const run=()=>navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(registration=>registration.update().catch(()=>{})).catch(()=>{});
    if(document.readyState==='complete')void run();
    else window.addEventListener('load',run,{once:true});
    const controller=()=>{if(live)window.dispatchEvent(new Event('happygo-sw-updated'))};
    navigator.serviceWorker.addEventListener('controllerchange',controller);
    return()=>{live=false;window.removeEventListener('load',run);navigator.serviceWorker.removeEventListener('controllerchange',controller)};
  },[]);
  return null;
}
