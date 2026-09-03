'use client';
import {useEffect} from 'react';

export function PwaRegister(){
  useEffect(()=>{
    if(!('serviceWorker' in navigator))return;
    const run=()=>navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{});
    if(document.readyState==='complete')run();
    else window.addEventListener('load',run,{once:true});
    return()=>window.removeEventListener('load',run);
  },[]);
  return null;
}
