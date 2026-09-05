'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {AffiliateSalesToolkit} from '@/components/AffiliateSalesToolkit';

type Product={id:string;slug:string;type:string;name:string;place:string;cover:string;publicPrice:number;affiliateLink:string;media:string[];albumUrl:string};
type Dashboard={affiliate:{commissionRate:number;referralCode:string};products?:Product[];villas:Product[]};

export function AffiliateSalesToolkitDrawer(){
 const[open,setOpen]=useState(false),[data,setData]=useState<Dashboard|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const request=useRef(0);
 const load=useCallback(async()=>{
  const id=++request.current;setBusy(true);setError('');
  try{const r=await fetch('/api/affiliate/dashboard',{cache:'no-store'});const d=await r.json().catch(()=>({}));if(id!==request.current)return;if(!r.ok)throw new Error(d.error||'Không tải được bộ công cụ CTV.');setData(d)}catch(e){if(id===request.current)setError(e instanceof Error?e.message:'Không tải được bộ công cụ CTV.')}finally{if(id===request.current)setBusy(false)}
 },[]);
 useEffect(()=>{if(open)void load()},[open,load]);
 useEffect(()=>{const refresh=()=>{if(open)void load()};window.addEventListener('focus',refresh);return()=>{request.current++;window.removeEventListener('focus',refresh)}},[open,load]);
 const close=()=>{request.current++;setOpen(false)};
 return <>
  <button type="button" className="affiliate-toolkit-fab" onClick={()=>setOpen(true)}>✦ Bộ công cụ bán hàng</button>
  {open&&<div className="affiliate-toolkit-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
   <div className="affiliate-toolkit-drawer"><div className="affiliate-toolkit-drawer-head"><div><small>HAPPYGO TRAVEL · CTV</small><b>Công cụ chia sẻ & album ảnh</b>{busy&&data&&<span>Đang cập nhật...</span>}</div><div><button type="button" onClick={()=>void load()} disabled={busy} aria-label="Làm mới bộ công cụ">↻</button><button type="button" onClick={close} aria-label="Đóng bộ công cụ">×</button></div></div>{error&&<div className="affiliate-message" aria-live="polite">{error}</div>}{data?<AffiliateSalesToolkit products={data.products?.length?data.products:data.villas||[]} commissionRate={Number(data.affiliate?.commissionRate||0)} referralCode={String(data.affiliate?.referralCode||'')}/>:<div className="affiliate-loading compact">{busy?'Đang tải bộ công cụ...':'Chưa có dữ liệu bộ công cụ.'}</div>}</div>
  </div>}
 </>;
}
