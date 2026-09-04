'use client';

import {useCallback,useEffect,useMemo,useState} from 'react';

type Status='new'|'contacting'|'confirmed'|'completed'|'cancelled';
type BookingItem={id:string;productName:string;unitName:string;quantity:number;sellingPrice:number;costPrice:number|null;kind:string};
type Booking={id:string;code:string;status:Status;source:string;customerName:string;phone:string;email:string;startDate:string;endDate:string;adults:number;children:number;rooms:number;sellingTotal:number;costTotal:number|null;note:string;adminNote:string;salesStaffId:string;salesStaffName:string;salesAssignedAt:string;createdAt:string;updatedAt:string;items:BookingItem[]};
type Capabilities={showCost:boolean;operate:boolean;elevated:boolean};
const labels:Record<Status,string>={new:'Mới',contacting:'Đang tư vấn',confirmed:'Đã xác nhận',completed:'Hoàn thành',cancelled:'Hủy'};
const statusClass:Record<Status,string>={new:'status-new',contacting:'status-contacting',confirmed:'status-confirmed',completed:'status-completed',cancelled:'status-cancelled'};
const money=(value:number|null|undefined)=>value===null||value===undefined?'—':new Intl.NumberFormat('vi-VN').format(Math.round(Number(value)||0))+'đ';
const digits=(value:string)=>value.replace(/\D/g,'');

function mirrorLegacy(items:Booking[]){
 try{
  const legacy=items.map(b=>({id:b.id,code:b.code,kind:b.items[0]?.kind||'Dịch vụ',product:b.items.map(x=>x.productName).filter(Boolean).join(', ')||'Dịch vụ HappyGo',customer_name:b.customerName,phone:b.phone,email:b.email,start_date:b.startDate||null,end_date:b.endDate||null,adults:b.adults,children:b.children,rooms:b.rooms,note:b.note,status:b.status,admin_note:b.adminNote,created_at:b.createdAt,source:b.source,salesStaffId:b.salesStaffId,salesStaffName:b.salesStaffName,salesAssignedAt:b.salesAssignedAt,revenue:b.sellingTotal,costPrice:b.costTotal}));
  localStorage.setItem('tn_local_bookings_v1',JSON.stringify(legacy));window.dispatchEvent(new Event('tn-bookings-updated'));
 }catch{}
}

export function AdminBookings(){
 const[items,setItems]=useState<Booking[]>([]),[caps,setCaps]=useState<Capabilities>({showCost:false,operate:false,elevated:false}),[loading,setLoading]=useState(true),[busy,setBusy]=useState(''),[msg,setMsg]=useState(''),[q,setQ]=useState(''),[filter,setFilter]=useState(''),[open,setOpen]=useState<Record<string,boolean>>({}),[selling,setSelling]=useState<Record<string,string>>({}),[cost,setCost]=useState<Record<string,string>>({}),[notes,setNotes]=useState<Record<string,string>>({});
 const load=useCallback(async()=>{setLoading(true);setMsg('');try{const r=await fetch('/api/admin/bookings',{cache:'no-store'});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(r.status===401?'Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại.':data.error||'Không đọc được booking.');const next=Array.isArray(data.bookings)?data.bookings as Booking[]:[];setItems(next);setCaps(data.capabilities||{showCost:false,operate:false,elevated:false});mirrorLegacy(next)}catch(error){setMsg(error instanceof Error?error.message:'Không kết nối được booking production.')}finally{setLoading(false)}},[]);
 useEffect(()=>{void load()},[load]);
 const visible=useMemo(()=>{const needle=q.trim().toLowerCase();return items.filter(b=>(!filter||b.status===filter)&&(!needle||`${b.code} ${b.customerName} ${b.phone} ${b.email} ${b.items.map(x=>x.productName).join(' ')}`.toLowerCase().includes(needle)))},[items,q,filter]);
 const stats=useMemo(()=>({newCount:items.filter(x=>x.status==='new').length,active:items.filter(x=>['new','contacting','confirmed'].includes(x.status)).length,confirmed:items.filter(x=>x.status==='confirmed').length,revenue:items.filter(x=>x.status!=='cancelled').reduce((sum,x)=>sum+x.sellingTotal,0)}),[items]);
 async function patch(id:string,changes:Record<string,unknown>){setBusy(id);setMsg('');try{const r=await fetch('/api/admin/bookings',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,...changes})});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Không thể cập nhật booking.');await load();setMsg('Đã lưu booking vào dữ liệu production.')}catch(error){setMsg(error instanceof Error?error.message:'Không thể cập nhật booking.')}finally{setBusy('')}}
 function saveSelling(b:Booking){const raw=selling[b.id]??String(b.sellingTotal||0);void patch(b.id,{sellingTotal:Number(digits(raw)||0)})}
 function saveCost(b:Booking){const raw=cost[b.id]??String(b.costTotal||0);void patch(b.id,{costTotal:Number(digits(raw)||0)})}
 function saveNote(b:Booking){void patch(b.id,{adminNote:notes[b.id]??b.adminNote})}
 return <section className="admin-panel admin-bookings-production">
  <div className="admin-panel-head"><div><small>PRODUCTION BOOKING</small><h2>Đơn đặt dịch vụ</h2><p>Booking từ website được đọc và cập nhật trực tiếp trên Neon. Không còn phụ thuộc dữ liệu của một trình duyệt.</p></div><button type="button" onClick={()=>void load()} disabled={loading}>↻ {loading?'Đang tải':'Làm mới'}</button></div>
  <div className="staff-department-summary"><button type="button"><b>{stats.newCount}</b><span>Booking mới</span></button><button type="button"><b>{stats.active}</b><span>Đang xử lý</span></button><button type="button"><b>{stats.confirmed}</b><span>Đã xác nhận</span></button><button type="button"><b>{money(stats.revenue)}</b><span>Tổng giá bán đang theo dõi</span></button></div>
  {msg&&<p className="admin-api-note">{msg}</p>}
  <div className="admin-form-row"><label>Tìm booking<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Mã booking, khách, số điện thoại, sản phẩm"/></label><label>Trạng thái<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(labels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label></div>
  {loading?<div className="admin-empty-state">Đang tải booking production...</div>:visible.length?<div className="admin-customer-grid">{visible.map(b=>{const expanded=Boolean(open[b.id]);const product=b.items.map(x=>[x.productName,x.unitName].filter(Boolean).join(' · ')).filter(Boolean).join(', ')||'Dịch vụ HappyGo';return <article className="admin-customer-card" key={b.id}>
   <div><b>{b.code}</b><span>{b.customerName}</span><small>{b.phone}{b.email?` · ${b.email}`:''}</small></div>
   <div><b>{product}</b><span>{b.startDate||'Chưa có ngày'}{b.endDate?` → ${b.endDate}`:''}</span><small>{b.adults} NL · {b.children} TE · {b.rooms} phòng/căn · {b.source||'website'}</small></div>
   <div><span className={statusClass[b.status]}>{labels[b.status]}</span><b>{money(b.sellingTotal)}</b><small>{b.salesStaffName?`Sale: ${b.salesStaffName}`:'Chưa phân Sale'}</small></div>
   <div className="pm-actions"><button type="button" onClick={()=>setOpen(x=>({...x,[b.id]:!expanded}))}>{expanded?'Thu gọn':'Xử lý'}</button></div>
   {expanded&&<div className="span-4" style={{width:'100%',gridColumn:'1 / -1'}}><div className="tour-editor-grid">
    <label>Trạng thái<select value={b.status} disabled={busy===b.id} onChange={e=>void patch(b.id,{status:e.target.value})}>{Object.entries(labels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
    <label>Giá bán<input inputMode="numeric" value={selling[b.id]??String(b.sellingTotal||'')} onChange={e=>setSelling(x=>({...x,[b.id]:e.target.value}))} placeholder="0"/></label>
    {caps.showCost&&<label>Giá vốn<input inputMode="numeric" value={cost[b.id]??String(b.costTotal||'')} onChange={e=>setCost(x=>({...x,[b.id]:e.target.value}))} placeholder="0"/></label>}
    <label className="span-2">Ghi chú khách<textarea rows={3} value={b.note} readOnly/></label>
    <label className="span-2">Ghi chú / xác nhận nội bộ<textarea rows={4} value={notes[b.id]??b.adminNote} onChange={e=>setNotes(x=>({...x,[b.id]:e.target.value}))} placeholder="Thông tin xác nhận, thanh toán, chính sách..."/></label>
    <div className="span-2 editor-actions"><button type="button" onClick={()=>saveSelling(b)} disabled={busy===b.id}>Lưu giá bán</button>{caps.showCost&&<button type="button" onClick={()=>saveCost(b)} disabled={busy===b.id}>Lưu giá vốn</button>}<button type="button" className="admin-primary" onClick={()=>saveNote(b)} disabled={busy===b.id}>{busy===b.id?'Đang lưu...':'Lưu nội dung'}</button></div>
   </div></div>}
  </article>})}</div>:<div className="admin-empty-state"><b>Chưa có booking production phù hợp</b><span>Booking khách gửi từ website sẽ xuất hiện tại đây.</span></div>}
  <p className="admin-connect-note">Dữ liệu chính của module này là Neon. Một bản mirror tương thích vẫn được cập nhật vào trình duyệt để các module vận hành cũ tiếp tục đọc trong giai đoạn chuyển đổi.</p>
 </section>;
}
