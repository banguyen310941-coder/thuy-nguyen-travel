'use client';

import {useEffect,useMemo,useState} from 'react';

type Receipt={id:string;receiptNo:string;bookingId:string;bookingCode:string;customerName:string;type:string;amount:number;method:string;transactionRef:string;note:string;paidAt:string};
type Booking={id:string;code:string;customerName:string;sellingTotal:number;paidTotal:number};
type ApiData={receipts:Receipt[];bookings:Booking[];capabilities:{create:boolean;all:boolean}};

const money=(value:number)=>new Intl.NumberFormat('vi-VN').format(Math.round(value))+'đ';
const today=()=>new Date().toISOString().slice(0,10);

export function AdminCustomerReceipts(){
 const[data,setData]=useState<ApiData>({receipts:[],bookings:[],capabilities:{create:false,all:false}});
 const[loading,setLoading]=useState(true),[message,setMessage]=useState(''),[open,setOpen]=useState(false),[query,setQuery]=useState('');
 const[bookingId,setBookingId]=useState(''),[amount,setAmount]=useState(''),[paidAt,setPaidAt]=useState(today()),[method,setMethod]=useState('Chuyển khoản'),[transactionRef,setTransactionRef]=useState(''),[note,setNote]=useState('');
 async function load(){setLoading(true);try{const res=await fetch('/api/admin/customer-receipts',{cache:'no-store'});const json=await res.json();if(!res.ok)throw new Error(json.error||'Không đọc được phiếu thu.');setData(json)}catch(error){setMessage(error instanceof Error?error.message:'Không đọc được phiếu thu.')}finally{setLoading(false)}}
 useEffect(()=>{void load()},[]);
 const selected=data.bookings.find(item=>item.id===bookingId);const remaining=selected?Math.max(0,selected.sellingTotal-selected.paidTotal):0;
 const visible=useMemo(()=>data.receipts.filter(item=>!query.trim()||`${item.receiptNo} ${item.bookingCode} ${item.customerName} ${item.transactionRef} ${item.method}`.toLowerCase().includes(query.toLowerCase())),[data.receipts,query]);
 const total=visible.reduce((sum,item)=>sum+item.amount,0);
 async function save(){const value=Number(amount.replace(/\D/g,''));if(!bookingId||value<=0)return setMessage('Chọn booking và nhập số tiền đã thu.');if(selected?.sellingTotal&&value>remaining&&remaining>0&&!confirm(`Số tiền này vượt số còn phải thu ${money(remaining)}. Vẫn ghi phiếu?`))return;setMessage('Đang lưu...');try{const res=await fetch('/api/admin/customer-receipts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({bookingId,amount:value,paidAt,method,transactionRef,note})});const json=await res.json();if(!res.ok)throw new Error(json.error||'Không thể lưu phiếu thu.');setOpen(false);setBookingId('');setAmount('');setTransactionRef('');setNote('');setPaidAt(today());setMessage(`Đã tạo phiếu ${json.receiptNo}.`);await load()}catch(error){setMessage(error instanceof Error?error.message:'Không thể lưu phiếu thu.')}}
 return <section className="admin-panel customer-receipts">
  <div className="admin-panel-head receipt-head"><div><small>PHIẾU THU PRODUCTION</small><h2>Ghi nhận tiền khách</h2><p>Mỗi lần thu tiền được lưu trên Neon và tự động tạo bút toán thu trong sổ kế toán.</p></div>{data.capabilities.create&&<button className="admin-primary" onClick={()=>setOpen(value=>!value)}>+ Ghi phiếu thu</button>}</div>
  {message&&<p className="admin-api-note">{message}</p>}
  {open&&data.capabilities.create&&<div className="receipt-form"><div className="receipt-grid">
   <label>Booking<select value={bookingId} onChange={event=>setBookingId(event.target.value)}><option value="">Chọn booking</option>{data.bookings.map(item=><option key={item.id} value={item.id}>{item.code} · {item.customerName} · còn {money(Math.max(0,item.sellingTotal-item.paidTotal))}</option>)}</select></label>
   <label>Số tiền đã thu<input inputMode="numeric" value={amount} onChange={event=>setAmount(event.target.value)} placeholder="5.000.000"/></label>
   <label>Ngày nhận tiền<input type="date" value={paidAt} onChange={event=>setPaidAt(event.target.value)}/></label>
   <label>Phương thức<select value={method} onChange={event=>setMethod(event.target.value)}><option>Chuyển khoản</option><option>Tiền mặt</option><option>MoMo / Ví điện tử</option><option>Thẻ</option><option>Khác</option></select></label>
   <label>Mã giao dịch / chứng từ<input value={transactionRef} onChange={event=>setTransactionRef(event.target.value)} placeholder="Không bắt buộc"/></label>
   <label>Ghi chú<input value={note} onChange={event=>setNote(event.target.value)} placeholder="Cọc lần 1, thanh toán đủ..."/></label>
  </div>{selected&&<p className="admin-api-note">Giá bán {money(selected.sellingTotal)} · Đã thu {money(selected.paidTotal)} · Còn {money(remaining)}</p>}<div className="receipt-actions"><button className="admin-primary" onClick={save}>Lưu phiếu thu</button><button className="admin-secondary" onClick={()=>setOpen(false)}>Hủy</button></div></div>}
  <div className="receipt-summary"><span><small>TỔNG PHIẾU ĐANG HIỂN THỊ</small><b>{money(total)}</b></span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Tìm số phiếu, booking, khách..."/></div>
  {loading?<div className="admin-empty-state">Đang tải dữ liệu production...</div>:<div className="receipt-list">{visible.map(item=><article key={item.id}><div><b>{item.receiptNo}</b><span>{item.bookingCode} · {item.customerName}</span></div><strong>{money(item.amount)}</strong><div><b>{item.method||'Chưa ghi phương thức'}</b><span>{new Date(item.paidAt).toLocaleDateString('vi-VN')}{item.transactionRef?` · ${item.transactionRef}`:''}</span></div><div><b>{item.type==='full'?'Thanh toán đủ':'Đặt cọc / thanh toán phần'}</b><span>{item.note||'Không có ghi chú'}</span></div></article>)}{!visible.length&&<div className="admin-empty-state">Chưa có phiếu thu.</div>}</div>}
 </section>
}
