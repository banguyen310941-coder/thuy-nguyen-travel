'use client';

import {useEffect,useState} from 'react';
import {AffiliateSalesToolkit} from '@/components/AffiliateSalesToolkit';

type Product={id:string;slug:string;type:string;name:string;place:string;cover:string;publicPrice:number;affiliateLink:string;media:string[];albumUrl:string};
type Dashboard={affiliate:{commissionRate:number;referralCode:string};products?:Product[];villas:Product[]};

export function AffiliateSalesToolkitDrawer(){
 const[open,setOpen]=useState(false),[data,setData]=useState<Dashboard|null>(null);
 useEffect(()=>{if(!open||data)return;void fetch('/api/affiliate/dashboard',{cache:'no-store'}).then(async r=>{if(r.ok)setData(await r.json())}).catch(()=>{})},[open,data]);
 return <>
  <button type="button" className="affiliate-toolkit-fab" onClick={()=>setOpen(true)}>✦ Bộ công cụ bán hàng</button>
  {open&&<div className="affiliate-toolkit-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
   <div className="affiliate-toolkit-drawer"><div className="affiliate-toolkit-drawer-head"><div><small>HAPPYGO TRAVEL · CTV</small><b>Công cụ chia sẻ & album ảnh</b></div><button type="button" onClick={()=>setOpen(false)}>×</button></div>{data?<AffiliateSalesToolkit products={data.products?.length?data.products:data.villas||[]} commissionRate={Number(data.affiliate?.commissionRate||0)} referralCode={String(data.affiliate?.referralCode||'')}/>:<div className="affiliate-loading compact">Đang tải bộ công cụ...</div>}</div>
  </div>}
 </>;
}
