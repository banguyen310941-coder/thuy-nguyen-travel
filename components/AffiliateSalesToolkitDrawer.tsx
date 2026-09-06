'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {AffiliateSalesToolkit} from '@/components/AffiliateSalesToolkit';

type Product={id:string;slug:string;type:string;name:string;place:string;cover:string;publicPrice:number;affiliateLink:string;media:string[];albumUrl:string};
type CommissionTier={minOrder:number;maxOrder:number|null;rate:number;label:string};
type CommissionPolicy={basis:'profit';basisLabel:string;closedOrders:number;nextOrderNumber:number;currentRate:number;currentTier:CommissionTier;nextTier:CommissionTier|null;tiers:CommissionTier[]};
type Dashboard={affiliate:{referralCode:string};commissionPolicy:CommissionPolicy;products?:Product[];villas:Product[]};

export function AffiliateSalesToolkitDrawer(){
 const[open,setOpen]=useState(false),[data,setData]=useState<Dashboard|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const request=useRef(0);
 const load=useCallback(async()=>{
  const id=++request.current;setBusy(true);setError('');
  try{const r=await fetch('/api/affiliate/dashboard',{cache:'no-store'});const d=await r.json().catch(()=>({}));if(id!==request.current)return;if(!r.ok)throw new Error(d.error||'Không tải được bộ công cụ CTV.');setData(d)}catch(e){if(id===request.current)setError(e instanceof Error?e.message:'Không tải được bộ công cụ CTV.')}finally{if(id===request.current)setBusy(false)}
 },[]);
 const close=useCallback(()=>{request.current++;setOpen(false)},[]);
 useEffect(()=>{if(open)void load()},[open,load]);
 useEffect(()=>{
  const refresh=()=>{if(open)void load()};
  const visibility=()=>{if(open&&document.visibilityState==='visible')void load()};
  const keyboard=(event:KeyboardEvent)=>{if(open&&event.key==='Escape')close()};
  window.addEventListener('focus',refresh);
  document.addEventListener('visibilitychange',visibility);
  window.addEventListener('keydown',keyboard);
  return()=>{request.current++;window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('keydown',keyboard)};
 },[open,load,close]);
 return <>
  <button type="button" className="affiliate-toolkit-fab" onClick={()=>setOpen(true)}>✦ Bộ công cụ bán hàng</button>
  {open&&<div className="affiliate-toolkit-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
   <div className="affiliate-toolkit-drawer" role="dialog" aria-modal="true" aria-label="Bộ công cụ bán hàng CTV"><div className="affiliate-toolkit-drawer-head"><div><small>HAPPYGO TRAVEL · CTV</small><b>Công cụ chia sẻ & album ảnh</b>{busy&&data&&<span>Đang cập nhật...</span>}</div><div><button type="button" onClick={()=>void load()} disabled={busy} aria-label="Làm mới bộ công cụ">↻</button><button type="button" onClick={close} aria-label="Đóng bộ công cụ">×</button></div></div>{error&&<div className="affiliate-message" aria-live="polite">{error}</div>}{data?<AffiliateSalesToolkit products={data.products?.length?data.products:data.villas||[]} commissionPolicy={data.commissionPolicy} referralCode={String(data.affiliate?.referralCode||'')}/>:<div className="affiliate-loading compact">{busy?'Đang tải bộ công cụ...':'Chưa có dữ liệu bộ công cụ.'}</div>}</div>
  </div>}
 </>;
}
