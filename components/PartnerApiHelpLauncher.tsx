'use client';

import {useState} from 'react';
import {PartnerApiGuide} from '@/components/PartnerApiGuide';

export function PartnerApiHelpLauncher(){
 const[open,setOpen]=useState(false);
 return <>
  <button type="button" onClick={()=>setOpen(true)} style={{position:'fixed',right:18,bottom:72,zIndex:9998,border:0,borderRadius:999,padding:'12px 18px',background:'#0d67ac',color:'#fff',fontWeight:800,boxShadow:'0 8px 28px rgba(0,0,0,.18)',cursor:'pointer'}}>Hướng dẫn đồng bộ API</button>
  {open&&<div role="dialog" aria-modal="true" aria-label="Hướng dẫn đồng bộ API" style={{position:'fixed',inset:0,zIndex:10000,background:'rgba(10,34,53,.68)',padding:'24px',overflow:'auto'}} onClick={()=>setOpen(false)}><div style={{maxWidth:980,margin:'20px auto',background:'#fff',borderRadius:18,boxShadow:'0 24px 80px rgba(0,0,0,.28)',padding:'28px',position:'relative'}} onClick={e=>e.stopPropagation()}><button type="button" onClick={()=>setOpen(false)} aria-label="Đóng hướng dẫn" style={{position:'sticky',top:0,float:'right',border:0,borderRadius:999,width:38,height:38,background:'#173f61',color:'#fff',fontSize:22,cursor:'pointer'}}>×</button><PartnerApiGuide/></div></div>}
 </>;
}
