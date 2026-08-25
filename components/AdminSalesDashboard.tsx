'use client';

import {useEffect,useMemo,useState} from 'react';

type Booking={id:number;code:string;kind:string;product:string;customer_name:string;phone:string;status:'new'|'contacting'|'confirmed'|'completed'|'cancelled';created_at:string;start_date?:string|null;note?:string|null};
const KEY='tn_local_bookings_v1';
const labels:Record<Booking['status'],string>={new:'Mới',contacting:'Đang tư vấn',confirmed:'Đã xác nhận',completed:'Hoàn thành',cancelled:'Hủy'};
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]') as Booking[]}catch{return []}}

export function AdminSalesDashboard({openBookings,openCustomers}:{openBookings:()=>void;openCustomers:()=>void}){
 const[items,setItems]=useState<Booking[]>([]);
 useEffect(()=>{const refresh=()=>setItems(read());refresh();window.addEventListener('tn-bookings-updated',refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener('tn-bookings-updated',refresh);window.removeEventListener('storage',refresh)}},[]);
 const data=useMemo(()=>{const sorted=[...items].sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());const customers=new Set(items.map(x=>x.phone.replace(/\D/g,''))).size;return{customers,total:items.length,newCount:items.filter(x=>x.status==='new').length,contacting:items.filter(x=>x.status==='contacting').length,confirmed:items.filter(x=>x.status==='confirmed').length,recent:sorted.slice(0,5)}},[items]);
 return <>
  <div className="admin-stats dashboard"><button type="button" className="stat-blue" onClick={openCustomers}><span>👤 Khách hàng</span><b>{data.customers}</b><small>Hồ sơ khách từ booking</small></button><button type="button" className="stat-orange" onClick={openBookings}><span>🟠 Lead mới</span><b>{data.newCount}</b><small>Cần liên hệ sớm</small></button><button type="button" className="stat-purple" onClick={openBookings}><span>☎ Đang tư vấn</span><b>{data.contacting}</b><small>Sale đang theo dõi</small></button><button type="button" className="stat-green" onClick={openBookings}><span>✓ Đã xác nhận</span><b>{data.confirmed}</b><small>Booking đã chốt</small></button></div>
  <section className="admin-panel"><div className="admin-panel-head"><div><h2>Lead mới nhất</h2><p>{data.total?`Đang có ${data.total} yêu cầu đặt dịch vụ.`:'Chưa có lead trên thiết bị này.'}</p></div><button type="button" className="admin-secondary" onClick={openBookings}>Xem tất cả đơn →</button></div>{data.recent.length?<div className="admin-product-list">{data.recent.map(item=><article key={item.id}><div className="admin-dashboard-lead-icon">{item.kind.toLowerCase().includes('tour')?'✈':item.kind.toLowerCase().includes('du thuyền')?'≋':'⌂'}</div><div><b>{item.customer_name} · {item.code}</b><span>{item.product} · {new Date(item.created_at).toLocaleString('vi-VN')}</span></div><em className={`status-${item.status}`}>{labels[item.status]}</em></article>)}</div>:<div className="admin-empty-state"><b>Chưa có yêu cầu mới</b><p>Khi khách gửi form hoặc checkout, lead sẽ hiện ngay tại đây.</p></div>}</section>
 </>;
}
