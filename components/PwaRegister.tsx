'use client';
import {useEffect} from 'react';
export function PwaRegister(){useEffect(()=>{if(!('serviceWorker'in navigator))return;const run=()=>{const base=window.location.pathname.startsWith('/thuy-nguyen-travel')?'/thuy-nguyen-travel':'';return navigator.serviceWorker.register(`${base}/sw.js`,{scope:`${base}/`}).catch(()=>{})};if(document.readyState==='complete')run();else window.addEventListener('load',run,{once:true});return()=>window.removeEventListener('load',run)},[]);return null}
