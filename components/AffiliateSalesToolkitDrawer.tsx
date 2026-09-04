'use client';

import {useEffect,useState} from 'react';
import {AffiliateSalesToolkit} from '@/components/AffiliateSalesToolkit';

type Villa={id:string;name:string;place:string;publicPrice:number;affiliateLink:string};
type Dashboard={affiliate:{commissionRate:number;referralCode:string};villas:Villa[]};

export function AffiliateSalesToolkitDrawer(){
 const[open,setOpen]=useState(false),[data,setData]=useState<Dashboard|null>(null);
 useEffect(()=>{if(!open||data)return;void fetch('/api/affiliate/dashboard',{cache:'no-store'}).then(async r=>{if(r.ok)setData(await r.json())}).catch(()=>{})},[open,data]);
 return <>
  <button type="button" className="affiliate-toolkit-fab" onClick={()=>setOpen(true)}>✦ Bộ công cụ bán hàng</button>
  {open&&<div className="affiliate-toolkit-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
   <div className="affiliate-toolkit-drawer"><div className="affiliate-toolkit-drawer-head"><div><small>HAPPYGO TRAVEL · CTV</small><b>Công cụ chia sẻ & chính sách</b></div><button type="button" onClick={()=>setOpen(false)}>×</button></div>{data?<AffiliateSalesToolkit villas={data.villas||[]} commissionRate={Number(data.affiliate?.commissionRate||0)} referralCode={String(data.affiliate?.referralCode||'')}/>:<div className="affiliate-loading compact">Đang tải bộ công cụ...</div>}</div>
  </div>}
 </>;
}
