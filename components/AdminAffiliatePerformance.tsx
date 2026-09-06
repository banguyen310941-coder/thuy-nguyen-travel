'use client';

import {useCallback,useEffect,useMemo,useRef,useState} from 'react';

type Summary={totalCtv:number;activeCtv:number;clicks30:number;bookings30:number;conversionRate:number;commission30:number;paidPayouts30:number;pendingPayouts:number;needsAttention:number;overdueFollowups:number};
type Item={id:string;name:string;referralCode:string;status:string;salesOwnerName:string;clicks30:number;bookings30:number;creditedOrders30:number;commission30:number;pendingOrders:number;pendingPayouts:number;paidPayouts30:number;conversionRate:number;lastFollowupAt:string;nextFollowUpAt:string;attentionReasons:string[];attentionScore:number};
type Payload={scope:'all'|'assigned';summary:Summary;items:Item[];generatedAt:string};
type Filter='all'|'attention'|'active'|'pending'|'blocked'|'overdue'|'no-booking'|'payout';
type Sort='attention'|'commission'|'conversion'|'clicks'|'bookings'|'payout';
const money=(v:number)=>new Intl.NumberFormat('vi-VN').format(Math.round(v))+'đ';
const number=(v:number)=>new Intl.NumberFormat('vi-VN').format(Math.round(v));
const fmt=(v:string)=>v?new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short'}).format(new Date(v)):'—';
const statusLabel=(v:string)=>({pending:'Chờ duyệt',active:'Đang hoạt động',blocked:'Đã khóa'} as Record<string,string>)[v]||v;

export function AdminAffiliatePerformance(){
 const request=useRef(0);
 const[data,setData]=useState<Payload|null>(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState(''),[q,setQ]=useState(''),[filter,setFilter]=useState<Filter>('all'),[sort,setSort]=useState<Sort>('attention');
 const load=useCallback(async()=>{
  const id=++request.current;setBusy(true);setMsg('');
  try{const r=await fetch('/api/admin/affiliate-performance',{cache:'no-store'});const d=await r.json().catch(()=>({}));if(id!==request.current)return;if(!r.ok)throw new Error(d.error||'Không đọc được hiệu suất CTV.');setData(d)}catch(error){if(id===request.current)setMsg(error instanceof Error?error.message:'Không đọc được hiệu suất CTV.')}finally{if(id===request.current)setBusy(false)}
 },[]);
 useEffect(()=>{
  const requestRef=request;
  void load();
  const refresh=()=>void load();
  const visibility=()=>{if(document.visibilityState==='visible')void load()};
  window.addEventListener('happygo-network-updated',refresh);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',visibility);
  return()=>{requestRef.current++;window.removeEventListener('happygo-network-updated',refresh);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',visibility)};
 },[load]);
 const visible=useMemo(()=>{
  const needle=q.trim().toLowerCase();
  const rows=(data?.items||[]).filter(item=>{
   if(filter==='attention'&&item.attentionScore<=0)return false;
   if(filter==='overdue'&&!item.attentionReasons.includes('Quá hạn follow-up'))return false;
   if(filter==='no-booking'&&!item.attentionReasons.includes('Có click nhưng chưa ra booking'))return false;
   if(filter==='payout'&&item.pendingPayouts<=0)return false;
   if(['active','pending','blocked'].includes(filter)&&item.status!==filter)return false;
   if(!needle)return true;
   return `${item.name} ${item.referralCode} ${item.salesOwnerName} ${item.attentionReasons.join(' ')}`.toLowerCase().includes(needle);
  });
  return [...rows].sort((a,b)=>sort==='commission'?b.commission30-a.commission30:sort==='conversion'?b.conversionRate-a.conversionRate:sort==='clicks'?b.clicks30-a.clicks30:sort==='bookings'?b.bookings30-a.bookings30:sort==='payout'?b.pendingPayouts-a.pendingPayouts:b.attentionScore-a.attentionScore||b.commission30-a.commission30);
 },[data,q,filter,sort]);
 const sendToFollowup=(item:Item)=>{
  const reasons=item.attentionReasons.length?` Cần xử lý: ${item.attentionReasons.join(', ')}.`:'';
  const suggestion=`Theo dõi hiệu suất 30 ngày: ${item.clicks30} click, ${item.bookings30} booking, chuyển đổi ${item.conversionRate}%, hoa hồng ${money(item.commission30)}.${reasons}`;
  window.dispatchEvent(new CustomEvent('happygo-affiliate-followup-select',{detail:{affiliateId:item.id,suggestion}}));
  setMsg(`Đã chuyển ${item.name} xuống CRM chăm sóc.`);
  requestAnimationFrame(()=>document.getElementById('admin-affiliate-followups')?.scrollIntoView({behavior:'smooth',block:'start'}));
 };
 const s=data?.summary;
 return <section className="admin-panel affiliate-admin">
  <div className="admin-panel-head"><div><small>HIỆU SUẤT CTV · 30 NGÀY</small><h2>Leaderboard, chuyển đổi & CTV cần chăm sóc</h2><p>{data?.scope==='assigned'?'Sale chỉ xem hiệu suất các CTV đang được giao cho mình.':'Admin/Owner xem hiệu suất toàn mạng lưới CTV.'} Số liệu không chứa SĐT khách hoặc thông tin ngân hàng.{data?.generatedAt&&<> · Cập nhật {fmt(data.generatedAt)}</>}</p></div><button type="button" className="admin-secondary" onClick={()=>void load()} disabled={busy}>{busy?'Đang cập nhật...':'↻ Làm mới'}</button></div>
  {msg&&<p className="admin-api-note" aria-live="polite">{msg}</p>}
  <div className="affiliate-admin-kpis"><article><small>CTV TRONG PHẠM VI</small><b>{number(s?.totalCtv||0)}</b><span>{number(s?.activeCtv||0)} đang hoạt động</span></article><article><small>CLICK · 30 NGÀY</small><b>{number(s?.clicks30||0)}</b><span>{number(s?.bookings30||0)} booking</span></article><article><small>CHUYỂN ĐỔI</small><b>{s?.conversionRate||0}%</b><span>click → booking</span></article><article><small>HOA HỒNG · 30 NGÀY</small><b>{money(s?.commission30||0)}</b><span>{money(s?.paidPayouts30||0)} đã thanh toán</span></article><article><small>PAYOUT ĐANG CHỜ</small><b>{money(s?.pendingPayouts||0)}</b><span>cần đối soát</span></article><article><small>CẦN CHĂM SÓC</small><b>{number(s?.needsAttention||0)}</b><span>{number(s?.overdueFollowups||0)} quá hạn follow-up</span></article></div>
  <div className="affiliate-admin-toolbar"><div className="pm-actions"><button type="button" className={filter==='all'?'admin-primary':''} onClick={()=>setFilter('all')}>Tất cả</button><button type="button" className={filter==='attention'?'admin-primary':''} onClick={()=>setFilter('attention')}>Cần xử lý</button><button type="button" className={filter==='overdue'?'admin-primary':''} onClick={()=>setFilter('overdue')}>Quá hạn</button><button type="button" className={filter==='no-booking'?'admin-primary':''} onClick={()=>setFilter('no-booking')}>Click chưa ra booking</button><button type="button" className={filter==='payout'?'admin-primary':''} onClick={()=>setFilter('payout')}>Payout chờ</button><button type="button" className={filter==='active'?'admin-primary':''} onClick={()=>setFilter('active')}>Đang hoạt động</button><button type="button" className={filter==='pending'?'admin-primary':''} onClick={()=>setFilter('pending')}>Chờ duyệt</button><button type="button" className={filter==='blocked'?'admin-primary':''} onClick={()=>setFilter('blocked')}>Đã khóa</button></div><span>Hiển thị {visible.length}/{data?.items.length||0} CTV</span></div>
  <div className="tour-editor-grid"><label className="span-2">Tìm CTV<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tên, mã CTV, Sale phụ trách hoặc cảnh báo" aria-label="Tìm CTV theo hiệu suất"/></label><label>Sắp xếp<select value={sort} onChange={e=>setSort(e.target.value as Sort)}><option value="attention">Ưu tiên cần xử lý</option><option value="commission">Hoa hồng cao nhất</option><option value="bookings">Booking cao nhất</option><option value="conversion">Chuyển đổi cao nhất</option><option value="clicks">Click cao nhất</option><option value="payout">Payout chờ cao nhất</option></select></label></div>
  <div className="affiliate-admin-table"><table><thead><tr><th>CTV</th><th>Sale phụ trách</th><th>Click 30N</th><th>Booking 30N</th><th>Chuyển đổi</th><th>Hoa hồng 30N</th><th>Payout chờ</th><th>Follow-up</th><th>Ưu tiên</th></tr></thead><tbody>{visible.map(item=><tr key={item.id}><td><b>{item.name}</b><small>{item.referralCode} · {statusLabel(item.status)}</small></td><td>{item.salesOwnerName}</td><td>{number(item.clicks30)}</td><td><b>{number(item.bookings30)}</b><small>{item.creditedOrders30} đã ghi hoa hồng · {item.pendingOrders} chờ</small></td><td><b>{item.conversionRate}%</b></td><td><b>{money(item.commission30)}</b><small>{money(item.paidPayouts30)} payout 30N</small></td><td>{item.pendingPayouts?<b>{money(item.pendingPayouts)}</b>:'—'}</td><td><span className={item.nextFollowUpAt&&new Date(item.nextFollowUpAt).getTime()<Date.now()?'status-cancelled':'status-confirmed'}>{item.nextFollowUpAt?fmt(item.nextFollowUpAt):'Chưa hẹn'}</span><small>{item.lastFollowupAt?`Gần nhất ${fmt(item.lastFollowupAt)}`:'Chưa chăm sóc'}</small></td><td>{item.attentionReasons.length?<div>{item.attentionReasons.map(reason=><span key={reason} className="status-pending">{reason}</span>)}</div>:<span className="status-confirmed">Ổn định</span>}<div className="pm-actions"><button type="button" className="admin-secondary" onClick={()=>sendToFollowup(item)}>Chăm sóc ngay ↓</button></div></td></tr>)}{!visible.length&&!busy&&<tr><td colSpan={9}>Không có CTV phù hợp bộ lọc.</td></tr>}{busy&&!data&&<tr><td colSpan={9}>Đang tổng hợp hiệu suất CTV...</td></tr>}</tbody></table></div>
 </section>;
}
