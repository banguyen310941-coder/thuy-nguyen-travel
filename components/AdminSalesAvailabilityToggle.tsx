"use client";

import {useEffect,useState} from "react";
import {SALES_AVAILABILITY_EVENT,SALES_AVAILABILITY_KEY,isSalesStaff,type AdminStaff,type SalesAvailability} from "@/components/AdminSalesAccess";

type ApiData={states:Record<string,SalesAvailability>;actorId:string;canToggle:boolean};

export function AdminSalesAvailabilityToggle({staff}:{staff:AdminStaff}){
 const[receiving,setReceiving]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function load(){try{const res=await fetch('/api/admin/sales-availability',{cache:'no-store'}),json=await res.json() as ApiData&{error?:string};if(!res.ok)throw new Error(json.error||'Không đọc được trạng thái nhận khách.');const states=json.states||{};setReceiving(states[staff.id]?.receivingCustomers!==false);try{localStorage.setItem(SALES_AVAILABILITY_KEY,JSON.stringify(states));window.dispatchEvent(new Event(SALES_AVAILABILITY_EVENT))}catch{}}catch(error){setMessage(error instanceof Error?error.message:'Không đọc được trạng thái nhận khách.')}}
 useEffect(()=>{if(isSalesStaff(staff))void load()},[staff.id]);
 if(!isSalesStaff(staff))return null;
 async function toggle(){const next=!receiving;setBusy(true);setMessage('');try{const res=await fetch('/api/admin/sales-availability',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({receivingCustomers:next})}),json=await res.json() as ApiData&{error?:string};if(!res.ok)throw new Error(json.error||'Không thể đổi trạng thái nhận khách.');const states=json.states||{};setReceiving(states[staff.id]?.receivingCustomers!==false);try{localStorage.setItem(SALES_AVAILABILITY_KEY,JSON.stringify(states));window.dispatchEvent(new Event(SALES_AVAILABILITY_EVENT))}catch{}}catch(error){setMessage(error instanceof Error?error.message:'Không thể đổi trạng thái nhận khách.')}finally{setBusy(false)}}
 return <div className="sales-availability-wrap"><button type="button" className={`sales-availability-toggle ${receiving?'is-on':'is-off'}`} aria-pressed={receiving} aria-label={receiving?'Tắt nhận khách mới':'Bật nhận khách mới'} title={receiving?'Nhấn để tạm ngưng nhận khách mới':'Nhấn để tiếp tục nhận khách mới'} onClick={()=>void toggle()} disabled={busy}><span className="sales-availability-dot" aria-hidden="true"/><span className="sales-availability-copy"><b>{busy?'Đang cập nhật...':receiving?'Đang nhận khách':'Tạm ngưng nhận khách'}</b><small>{receiving?'Có trong vòng chia khách':'Không nhận khách mới'}</small></span></button>{message&&<small className="sales-availability-error">{message}</small>}</div>
}
