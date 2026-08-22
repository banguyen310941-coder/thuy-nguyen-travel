'use client';

import { useEffect, useMemo, useState } from 'react';

type Booking={
  id:number;code:string;kind:string;product:string;customer_name:string;phone:string;email?:string|null;
  start_date?:string|null;end_date?:string|null;adults:number;children:number;rooms:number;note?:string|null;
  status:'new'|'contacting'|'confirmed'|'completed'|'cancelled';admin_note?:string|null;created_at:string;
};

const API_BASE=process.env.NEXT_PUBLIC_API_BASE_URL||'';
const labels:Record<Booking['status'],string>={new:'Mới',contacting:'Đang tư vấn',confirmed:'Đã xác nhận',completed:'Hoàn thành',cancelled:'Hủy'};

export function AdminBookings(){
  const [key,setKey]=useState('');
  const [items,setItems]=useState<Booking[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [q,setQ]=useState('');
  const [status,setStatus]=useState('');

  useEffect(()=>{setKey(localStorage.getItem('tn_admin_api_key')||'')},[]);

  async function load(){
    if(!API_BASE){setError('Chưa cấu hình NEXT_PUBLIC_API_BASE_URL. Khi có hosting, điền URL backend để đọc đơn thật.');return;}
    if(!key){setError('Nhập khóa quản trị API trước khi tải đơn.');return;}
    setLoading(true);setError('');
    try{
      const params=new URLSearchParams();if(q)params.set('q',q);if(status)params.set('status',status);
      const response=await fetch(`${API_BASE.replace(/\/$/,'')}/api/bookings?${params.toString()}`,{headers:{'x-admin-key':key}});
      if(!response.ok)throw new Error(response.status===401?'Khóa quản trị không đúng.':'Không tải được đơn.');
      const data=await response.json();setItems(data.items||[]);localStorage.setItem('tn_admin_api_key',key);
    }catch(e){setError(e instanceof Error?e.message:'Có lỗi xảy ra');}
    finally{setLoading(false)}
  }

  async function update(id:number,next:Booking['status']){
    if(!API_BASE||!key)return;
    const response=await fetch(`${API_BASE.replace(/\/$/,'')}/api/bookings/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json','x-admin-key':key},body:JSON.stringify({status:next})});
    if(response.ok)setItems(list=>list.map(item=>item.id===id?{...item,status:next}:item));
  }

  const stats=useMemo(()=>({all:items.length,new:items.filter(i=>i.status==='new').length,confirmed:items.filter(i=>i.status==='confirmed').length}),[items]);

  return <section className="admin-panel admin-bookings-live">
    <div className="admin-panel-head"><div><h2>Đơn & yêu cầu đặt dịch vụ</h2><p>Form khách gửi từ website sẽ xuất hiện tại đây khi backend được bật trên hosting.</p></div></div>
    <div className="admin-stats compact"><div><span>Tổng đơn đang tải</span><b>{stats.all}</b></div><div><span>Đơn mới</span><b>{stats.new}</b></div><div><span>Đã xác nhận</span><b>{stats.confirmed}</b></div></div>
    <div className="admin-form-row"><label>Khóa quản trị API<input type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="ADMIN_API_KEY"/></label><label>Tìm đơn<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Mã đơn, tên, SĐT, sản phẩm"/></label></div>
    <div className="admin-form-row"><label>Trạng thái<select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Tất cả</option><option value="new">Mới</option><option value="contacting">Đang tư vấn</option><option value="confirmed">Đã xác nhận</option><option value="completed">Hoàn thành</option><option value="cancelled">Hủy</option></select></label><div className="admin-load-wrap"><button className="admin-primary" onClick={load}>{loading?'Đang tải...':'Tải danh sách đơn'}</button></div></div>
    {error&&<p className="admin-api-note">{error}</p>}
    {items.length>0&&<div className="admin-booking-list">{items.map(item=><article key={item.id} className="admin-booking-card"><div className="admin-booking-code"><b>{item.code}</b><span>{new Date(item.created_at).toLocaleString('vi-VN')}</span></div><div><strong>{item.customer_name}</strong><a href={`tel:${item.phone}`}>{item.phone}</a><small>{item.email||'Không có email'}</small></div><div><strong>{item.product}</strong><small>{item.kind}</small><span>{item.start_date||'—'} → {item.end_date||'—'}</span><span>{item.adults} NL · {item.children} TE · {item.rooms} phòng</span></div><div className="admin-booking-status"><select value={item.status} onChange={e=>update(item.id,e.target.value as Booking['status'])}><option value="new">Mới</option><option value="contacting">Đang tư vấn</option><option value="confirmed">Đã xác nhận</option><option value="completed">Hoàn thành</option><option value="cancelled">Hủy</option></select><span className={`status-${item.status}`}>{labels[item.status]}</span><a href={`https://zalo.me/${item.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer">Zalo khách</a></div>{item.note&&<p className="admin-booking-note">Ghi chú: {item.note}</p>}</article>)}</div>}
  </section>
}
