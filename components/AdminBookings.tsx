'use client';

import { useEffect, useMemo, useState } from 'react';

type Booking={
  id:number;code:string;kind:string;product:string;customer_name:string;phone:string;email?:string|null;
  start_date?:string|null;end_date?:string|null;adults:number;children:number;rooms:number;note?:string|null;
  status:'new'|'contacting'|'confirmed'|'completed'|'cancelled';admin_note?:string|null;created_at:string;source?:string;
};

const API_BASE=process.env.NEXT_PUBLIC_API_BASE_URL||'';
const LOCAL_KEY='tn_local_bookings_v1';
const labels:Record<Booking['status'],string>={new:'Mới',contacting:'Đang tư vấn',confirmed:'Đã xác nhận',completed:'Hoàn thành',cancelled:'Hủy'};

function readLocal():Booking[]{
  try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||'[]') as Booking[]}catch{return []}
}
function writeLocal(items:Booking[]){
  try{localStorage.setItem(LOCAL_KEY,JSON.stringify(items));window.dispatchEvent(new Event('tn-bookings-updated'))}catch{}
}
function matches(item:Booking,q:string,status:string){
  const needle=q.trim().toLowerCase();
  const text=`${item.code} ${item.customer_name} ${item.phone} ${item.email||''} ${item.product} ${item.kind} ${item.note||''}`.toLowerCase();
  return (!needle||text.includes(needle))&&(!status||item.status===status);
}

export function AdminBookings(){
  const [key,setKey]=useState('');
  const [items,setItems]=useState<Booking[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [q,setQ]=useState('');
  const [status,setStatus]=useState('');
  const [mode,setMode]=useState<'local'|'api'>('local');

  useEffect(()=>{
    setKey(localStorage.getItem('tn_admin_api_key')||'');
    const refresh=()=>{if(!API_BASE||mode==='local')setItems(readLocal())};
    refresh();window.addEventListener('tn-bookings-updated',refresh);window.addEventListener('storage',refresh);
    return()=>{window.removeEventListener('tn-bookings-updated',refresh);window.removeEventListener('storage',refresh)};
  },[mode]);

  async function load(){
    setLoading(true);setError('');
    if(!API_BASE){setMode('local');setItems(readLocal());setLoading(false);return;}
    if(!key){setMode('local');setItems(readLocal());setError('Chưa nhập khóa API nên đang hiển thị đơn đã nhận trên thiết bị này.');setLoading(false);return;}
    try{
      const params=new URLSearchParams();if(q)params.set('q',q);if(status)params.set('status',status);
      const response=await fetch(`${API_BASE.replace(/\/$/,'')}/api/bookings?${params.toString()}`,{headers:{'x-admin-key':key}});
      if(!response.ok)throw new Error(response.status===401?'Khóa quản trị không đúng.':'Không tải được đơn từ backend.');
      const data=await response.json();setItems(data.items||[]);setMode('api');localStorage.setItem('tn_admin_api_key',key);
    }catch(e){setMode('local');setItems(readLocal());setError(`${e instanceof Error?e.message:'Có lỗi xảy ra'} Đang chuyển sang đơn lưu trên thiết bị này.`);}
    finally{setLoading(false)}
  }

  async function update(id:number,next:Booking['status']){
    if(mode==='local'||!API_BASE||!key){const updated=readLocal().map(item=>item.id===id?{...item,status:next}:item);writeLocal(updated);setItems(updated);return;}
    const response=await fetch(`${API_BASE.replace(/\/$/,'')}/api/bookings/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json','x-admin-key':key},body:JSON.stringify({status:next})});
    if(response.ok)setItems(list=>list.map(item=>item.id===id?{...item,status:next}:item));
  }

  const visible=useMemo(()=>items.filter(item=>matches(item,q,status)),[items,q,status]);
  const stats=useMemo(()=>({all:visible.length,new:visible.filter(i=>i.status==='new').length,confirmed:visible.filter(i=>i.status==='confirmed').length}),[visible]);

  return <section className="admin-panel admin-bookings-live">
    <div className="admin-panel-head"><div><h2>Đơn & yêu cầu đặt dịch vụ</h2><p>{mode==='api'?'Đang đọc dữ liệu từ backend.':'Đang đọc các yêu cầu khách đã gửi trên thiết bị này. Khi có hosting có thể đồng bộ sang backend.'}</p></div><span className={`admin-data-source ${mode}`}>{mode==='api'?'● Backend':'● Local'}</span></div>
    <div className="admin-stats compact"><div><span>Tổng đơn</span><b>{stats.all}</b></div><div><span>Đơn mới</span><b>{stats.new}</b></div><div><span>Đã xác nhận</span><b>{stats.confirmed}</b></div></div>
    {API_BASE&&<div className="admin-form-row"><label>Khóa quản trị API<input type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="ADMIN_API_KEY"/></label><div className="admin-load-wrap"><button className="admin-primary" onClick={load}>{loading?'Đang tải...':'Đồng bộ / tải backend'}</button></div></div>}
    <div className="admin-form-row"><label>Tìm đơn<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Mã đơn, tên, SĐT, sản phẩm, phòng/cabin"/></label><label>Trạng thái<select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Tất cả</option><option value="new">Mới</option><option value="contacting">Đang tư vấn</option><option value="confirmed">Đã xác nhận</option><option value="completed">Hoàn thành</option><option value="cancelled">Hủy</option></select></label></div>
    {error&&<p className="admin-api-note">{error}</p>}
    {visible.length>0?<div className="admin-booking-list">{visible.map(item=><article key={item.id} className="admin-booking-card"><div className="admin-booking-code"><b>{item.code}</b><span>{new Date(item.created_at).toLocaleString('vi-VN')}</span></div><div><strong>{item.customer_name}</strong><a href={`tel:${item.phone.replace(/\D/g,'')}`}>{item.phone}</a><small>{item.email||'Không có email'}</small></div><div><strong>{item.product}</strong><small>{item.kind}</small><span>{item.start_date||'—'} → {item.end_date||'—'}</span><span>{item.adults} NL · {item.children} TE · {item.rooms} {String(item.kind).toLowerCase().includes('du thuyền')?'cabin':String(item.kind).toLowerCase().includes('tour')?'đơn':'phòng/căn'}</span></div><div className="admin-booking-status"><select value={item.status} onChange={e=>update(item.id,e.target.value as Booking['status'])}><option value="new">Mới</option><option value="contacting">Đang tư vấn</option><option value="confirmed">Đã xác nhận</option><option value="completed">Hoàn thành</option><option value="cancelled">Hủy</option></select><span className={`status-${item.status}`}>{labels[item.status]}</span><a href={`https://zalo.me/${item.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer">Zalo khách</a></div>{item.note&&<p className="admin-booking-note">Ghi chú: {item.note}</p>}</article>)}</div>:<div className="admin-empty-state"><b>Chưa có đơn phù hợp</b><p>Khi khách gửi form đặt Tour/Villa/Khách sạn/Du thuyền, yêu cầu sẽ xuất hiện tại đây.</p></div>}
  </section>
}
