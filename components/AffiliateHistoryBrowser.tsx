'use client';

import {useCallback,useEffect,useRef,useState} from 'react';

type Referral={id:string;bookingCode:string;bookingStatus:string;villaName:string;customerPhone:string;commissionAmount:number;status:string;createdAt:string;creditedAt:string};
type Payout={id:string;amount:number;status:string;payoutDate:string;receiptUrl:string;createdAt:string};
type HistoryItem=Referral|Payout;
type Pagination={limit:number;offset:number;total:number;hasMore:boolean;nextOffset:number|null};
type Kind='referrals'|'payouts';

const money=(v:number)=>new Intl.NumberFormat('vi-VN').format(Math.round(v))+'đ';
const date=(v:string)=>v?new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short'}).format(new Date(v)):'—';
const statusLabel=(v:string)=>({pending:'Chờ xử lý',approved:'Đã duyệt',paid:'Đã thanh toán',cancelled:'Đã hủy',new:'Mới',contacting:'Đang tư vấn',confirmed:'Đã xác nhận',completed:'Hoàn tất'} as Record<string,string>)[v]||v;

export function AffiliateHistoryBrowser(){
 const[open,setOpen]=useState(false),[kind,setKind]=useState<Kind>('referrals'),[items,setItems]=useState<HistoryItem[]>([]),[pagination,setPagination]=useState<Pagination>({limit:50,offset:0,total:0,hasMore:false,nextOffset:null}),[busy,setBusy]=useState(false),[msg,setMsg]=useState('');
 const request=useRef(0);
 const loadPage=useCallback(async(kindValue:Kind,offset:number,append:boolean)=>{
  const id=++request.current;setBusy(true);setMsg('');
  try{
   const r=await fetch(`/api/affiliate/history?kind=${kindValue}&limit=50&offset=${offset}`,{cache:'no-store'});
   const d=await r.json().catch(()=>({}));
   if(id!==request.current)return;
   if(!r.ok)throw new Error(d.error||'Không tải được lịch sử giao dịch.');
   const incoming=(Array.isArray(d.items)?d.items:[]) as HistoryItem[];
   setItems(prev=>append?[...prev,...incoming.filter(row=>!prev.some(old=>old.id===row.id))]:incoming);
   setPagination({limit:Number(d.pagination?.limit||50),offset:Number(d.pagination?.offset||0),total:Number(d.pagination?.total||0),hasMore:Boolean(d.pagination?.hasMore),nextOffset:d.pagination?.nextOffset===null?null:Number(d.pagination?.nextOffset||0)});
  }catch(error){if(id===request.current)setMsg(error instanceof Error?error.message:'Không tải được lịch sử giao dịch.')}finally{if(id===request.current)setBusy(false)}
 },[]);
 useEffect(()=>{if(open)void loadPage(kind,0,false)},[open,kind,loadPage]);
 useEffect(()=>{const refresh=()=>{if(open)void loadPage(kind,0,false)};window.addEventListener('focus',refresh);return()=>window.removeEventListener('focus',refresh)},[open,kind,loadPage]);
 const close=()=>{request.current++;setOpen(false)};
 if(!open)return <section className="affiliate-panel"><div className="affiliate-panel-head"><div><small>LỊCH SỬ GIAO DỊCH</small><h2>Xem toàn bộ booking & thanh toán</h2><p>Mở lịch sử phân trang khi bạn cần tra cứu giao dịch cũ hơn dữ liệu tóm tắt trên Dashboard.</p></div><button type="button" onClick={()=>setOpen(true)}>Xem toàn bộ lịch sử</button></div></section>;
 return <section className="affiliate-panel">
  <div className="affiliate-panel-head"><div><small>LỊCH SỬ GIAO DỊCH · PRODUCTION</small><h2>Tra cứu toàn bộ giao dịch CTV</h2><p>{pagination.total} bản ghi · tải theo từng trang để Dashboard nhẹ hơn.</p></div><button type="button" onClick={close}>Đóng lịch sử</button></div>
  {msg&&<p className="affiliate-message" aria-live="polite">{msg}</p>}
  <div className="affiliate-payout-actions"><button type="button" className={kind==='referrals'?'primary':''} onClick={()=>setKind('referrals')} disabled={busy&&kind==='referrals'}>Booking & hoa hồng</button><button type="button" className={kind==='payouts'?'primary':''} onClick={()=>setKind('payouts')} disabled={busy&&kind==='payouts'}>Rút tiền & thanh toán</button><button type="button" onClick={()=>void loadPage(kind,0,false)} disabled={busy}>↻ Làm mới</button></div>
  {kind==='referrals'?<div className="affiliate-table-wrap"><table className="affiliate-table"><thead><tr><th>Booking</th><th>Sản phẩm</th><th>Khách</th><th>Booking</th><th>Hoa hồng</th><th>Duyệt tiền</th><th>Ngày</th></tr></thead><tbody>{(items as Referral[]).map(r=><tr key={r.id}><td><b>{r.bookingCode}</b></td><td>{r.villaName}</td><td>{r.customerPhone||'—'}</td><td><span className={`affiliate-status ${r.bookingStatus}`}>{statusLabel(r.bookingStatus)}</span></td><td><b>{money(r.commissionAmount)}</b>{r.creditedAt&&<small>Ghi nhận {date(r.creditedAt)}</small>}</td><td><span className={`affiliate-status ${r.status}`}>{statusLabel(r.status)}</span></td><td>{date(r.createdAt)}</td></tr>)}{!items.length&&!busy&&<tr><td colSpan={7}>Chưa có booking affiliate.</td></tr>}</tbody></table></div>:<div className="affiliate-table-wrap"><table className="affiliate-table"><thead><tr><th>Ngày</th><th>Số tiền</th><th>Trạng thái</th><th>Biên nhận</th></tr></thead><tbody>{(items as Payout[]).map(p=><tr key={p.id}><td>{date(p.payoutDate||p.createdAt)}</td><td><b>{money(p.amount)}</b></td><td><span className={`affiliate-status ${p.status}`}>{statusLabel(p.status)}</span></td><td>{p.receiptUrl?<a href={p.receiptUrl} target="_blank" rel="noreferrer">Xem biên nhận</a>:'—'}</td></tr>)}{!items.length&&!busy&&<tr><td colSpan={4}>Chưa có yêu cầu hoặc đợt thanh toán.</td></tr>}</tbody></table></div>}
  <div className="affiliate-payout-actions"><span>Đã tải {items.length}/{pagination.total}</span>{pagination.hasMore&&pagination.nextOffset!==null&&<button type="button" className="primary" onClick={()=>void loadPage(kind,pagination.nextOffset!,true)} disabled={busy}>{busy?'Đang tải...':'Tải thêm 50 bản ghi'}</button>}</div>
 </section>;
}
