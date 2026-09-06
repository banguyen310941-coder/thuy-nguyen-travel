'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';

type Metrics={clicks:number;referrals:number;creditedOrders:number;pendingOrders:number;creditedCommission:number;paidPayouts:number;pendingPayouts:number;conversionRate:number};
type TopProduct={id:string;name:string;type:string;clicks:number;bookings:number;creditedOrders:number;commission:number;conversionRate:number};
type Performance={allTime:Metrics;last30Days:Metrics;topProducts:TopProduct[];generatedAt:string};

const money=(v:number)=>new Intl.NumberFormat('vi-VN').format(Math.round(v))+'đ';
const number=(v:number)=>new Intl.NumberFormat('vi-VN').format(Math.round(v));
const dateTime=(v:string)=>v?new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short'}).format(new Date(v)):'—';

export function AffiliatePerformancePanel(){
 const router=useRouter();
 const request=useRef(0);
 const[data,setData]=useState<Performance|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const load=useCallback(async()=>{
  const id=++request.current;setBusy(true);setError('');
  try{
   const response=await fetch('/api/affiliate/performance',{cache:'no-store'});
   if(id!==request.current)return;
   if(response.status===401){router.replace('/affiliate');return}
   const body=await response.json().catch(()=>({}));
   if(id!==request.current)return;
   if(!response.ok)throw new Error(body.error||'Không tải được hiệu quả bán hàng.');
   setData(body);
  }catch(err){if(id===request.current)setError(err instanceof Error?err.message:'Không tải được hiệu quả bán hàng.')}finally{if(id===request.current)setBusy(false)}
 },[router]);
 useEffect(()=>{
  const requestRef=request;
  void load();
  const focus=()=>void load();
  const visibility=()=>{if(document.visibilityState==='visible')void load()};
  window.addEventListener('focus',focus);document.addEventListener('visibilitychange',visibility);
  return()=>{requestRef.current++;window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',visibility)};
 },[load]);

 const recent=data?.last30Days;
 const all=data?.allTime;
 return <section className="affiliate-panel affiliate-performance-panel">
  <div className="affiliate-panel-head"><div><small>HIỆU QUẢ BÁN HÀNG CTV</small><h2>Chuyển đổi, hoa hồng và sản phẩm nổi bật</h2><p>30 ngày gần nhất được tách riêng để CTV nhìn nhanh hiệu quả chia sẻ link, booking và dòng tiền.</p></div><div className="affiliate-payout-actions"><button type="button" onClick={()=>void load()} disabled={busy}>{busy?'Đang cập nhật...':'↻ Làm mới số liệu'}</button></div></div>
  {error&&<p className="affiliate-message" aria-live="polite">{error}</p>}
  {!data&&busy?<div className="affiliate-empty">Đang tổng hợp hiệu quả bán hàng...</div>:data?<>
   <div className="affiliate-kpis affiliate-performance-kpis">
    <article><small>CLICK · 30 NGÀY</small><strong>{number(recent?.clicks||0)}</strong><span>Lượt click hợp lệ đã ghi nhận</span></article>
    <article><small>BOOKING · 30 NGÀY</small><strong>{number(recent?.referrals||0)}</strong><span>Booking hợp lệ, không tính đơn hủy</span></article>
    <article><small>CLICK → BOOKING</small><strong>{recent?.conversionRate||0}%</strong><span>Tỷ lệ booking trên lượt click 30 ngày</span></article>
    <article><small>ĐƠN GHI HOA HỒNG</small><strong>{number(recent?.creditedOrders||0)}</strong><span>Booking đã được ghi có trong 30 ngày</span></article>
    <article><small>HOA HỒNG · 30 NGÀY</small><strong>{money(recent?.creditedCommission||0)}</strong><span>Hoa hồng đã ghi nhận trong kỳ</span></article>
    <article><small>ĐÃ THANH TOÁN · 30 NGÀY</small><strong>{money(recent?.paidPayouts||0)}</strong><span>Yêu cầu rút đã thanh toán trong kỳ</span></article>
    <article><small>ĐƠN ĐANG CHỜ</small><strong>{number(all?.pendingOrders||0)}</strong><span>Referral chưa được ghi có hoặc hủy</span></article>
    <article><small>RÚT TIỀN ĐANG CHỜ</small><strong>{money(all?.pendingPayouts||0)}</strong><span>Tổng yêu cầu rút đang chờ đối soát</span></article>
   </div>
   <div className="affiliate-panel-head affiliate-performance-summary"><div><small>TỔNG LŨY KẾ</small><h2>{number(all?.clicks||0)} click · {number(all?.referrals||0)} booking · {all?.conversionRate||0}% chuyển đổi</h2><p>Hoa hồng đã ghi nhận: {money(all?.creditedCommission||0)} · Đã thanh toán: {money(all?.paidPayouts||0)} · Cập nhật {dateTime(data.generatedAt)}</p></div></div>
   <div className="affiliate-table-wrap"><table className="affiliate-table"><thead><tr><th>Sản phẩm nổi bật 30 ngày</th><th>Loại</th><th>Click</th><th>Booking</th><th>Chuyển đổi</th><th>Đơn ghi hoa hồng</th><th>Hoa hồng</th></tr></thead><tbody>{data.topProducts.map(product=><tr key={product.id}><td><b>{product.name}</b></td><td>{product.type||'—'}</td><td>{number(product.clicks)}</td><td>{number(product.bookings)}</td><td>{product.conversionRate}%</td><td>{number(product.creditedOrders)}</td><td><b>{money(product.commission)}</b></td></tr>)}{!data.topProducts.length&&<tr><td colSpan={7}>Chưa có dữ liệu click/booking trong 30 ngày gần nhất.</td></tr>}</tbody></table></div>
  </>:<div className="affiliate-empty">Chưa có dữ liệu hiệu quả bán hàng.</div>}
 </section>;
}
