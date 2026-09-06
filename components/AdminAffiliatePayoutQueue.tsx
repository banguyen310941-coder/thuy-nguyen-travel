'use client';

import {useCallback,useEffect,useMemo,useRef,useState} from 'react';

type Payout={id:string;affiliateId:string;affiliateName:string;amount:number;status:string;createdAt:string;affiliateBalance:number;canPay:boolean;ageHours:number;bankAccount:string;bankName:string;accountHolder:string};
type Payload={ownershipScope?:string;priorityHours:number;stats:{pendingCount:number;totalAmount:number;overdueCount:number;insufficientBalanceCount:number;oldestCreatedAt:string};payouts:Payout[]};
type Decision='paid'|'cancelled';
type Filter='all'|'overdue'|'insufficient';
type Sort='oldest'|'amount';
const money=(v:number)=>new Intl.NumberFormat('vi-VN').format(Math.round(v))+'đ';
const dateTime=(v:string)=>v?new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short'}).format(new Date(v)):'—';
const ageLabel=(hours:number)=>hours>=48?`${Math.floor(hours/24)} ngày`:hours>=24?`${hours} giờ`:`${Math.max(hours,0)} giờ`;

export function AdminAffiliatePayoutQueue(){
 const request=useRef(0),decisionLocks=useRef(new Set<string>()),decisionRequestIds=useRef(new Map<string,string>());
 const[data,setData]=useState<Payload|null>(null),[busy,setBusy]=useState(false),[processing,setProcessing]=useState<string[]>([]),[msg,setMsg]=useState(''),[q,setQ]=useState(''),[filter,setFilter]=useState<Filter>('all'),[sort,setSort]=useState<Sort>('oldest');
 const load=useCallback(async()=>{
  const id=++request.current;setBusy(true);
  try{const r=await fetch('/api/admin/affiliate-payout-decisions',{cache:'no-store'});const d=await r.json().catch(()=>({}));if(id!==request.current)return;if(!r.ok)throw new Error(d.error||'Không đọc được hàng chờ payout CTV.');setData(d);setMsg('')}catch(error){if(id===request.current)setMsg(error instanceof Error?error.message:'Không đọc được hàng chờ payout CTV.')}finally{if(id===request.current)setBusy(false)}
 },[]);
 useEffect(()=>{
  void load();const refresh=()=>void load();const visibility=()=>{if(document.visibilityState==='visible')void load()};
  window.addEventListener('happygo-network-updated',refresh);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',visibility);
  return()=>{request.current++;window.removeEventListener('happygo-network-updated',refresh);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',visibility)};
 },[load]);
 const priorityHours=data?.priorityHours||24;
 const visible=useMemo(()=>{
  const term=q.trim().toLowerCase();
  const rows=[...(data?.payouts||[])].filter(p=>{
   if(term&&!`${p.affiliateName} ${p.bankName} ${p.bankAccount} ${p.accountHolder} ${p.id}`.toLowerCase().includes(term))return false;
   if(filter==='overdue'&&p.ageHours<priorityHours)return false;
   if(filter==='insufficient'&&p.canPay)return false;
   return true;
  });
  rows.sort((a,b)=>sort==='amount'?b.amount-a.amount:new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime());
  return rows;
 },[data,filter,priorityHours,q,sort]);
 async function resolve(payout:Payout,decision:Decision){
  if(decisionLocks.current.has(payout.id))return;
  if(decision==='paid'&&!payout.canPay){setMsg(`Chưa thể duyệt: số dư hiện tại ${money(payout.affiliateBalance)} thấp hơn payout ${money(payout.amount)}.`);return}
  let receiptUrl='';
  if(decision==='paid'){
   const receipt=window.prompt(`URL biên nhận HTTPS cho ${payout.affiliateName} (có thể để trống)`,'');
   if(receipt===null)return;receiptUrl=receipt.trim();
   if(receiptUrl&&!/^https:\/\//i.test(receiptUrl)){setMsg('Biên nhận phải là URL HTTPS.');return}
  }
  const bank=[payout.bankName,payout.bankAccount,payout.accountHolder].filter(Boolean).join(' · ')||'Chưa có thông tin ngân hàng';
  const text=decision==='paid'?`Duyệt payout ${money(payout.amount)} cho ${payout.affiliateName}?\n${bank}`:`Hủy yêu cầu payout ${money(payout.amount)} của ${payout.affiliateName}?\nHành động này không thay đổi số dư CTV.`;
  if(!window.confirm(text))return;
  decisionLocks.current.add(payout.id);setProcessing(current=>[...current,payout.id]);setMsg('');
  const key=`${payout.id}:${decision}`;
  let requestId=decisionRequestIds.current.get(key);
  if(!requestId){requestId=crypto.randomUUID();decisionRequestIds.current.set(key,requestId)}
  try{
   const r=await fetch('/api/admin/affiliate-payout-decisions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({payoutId:payout.id,decision,receiptUrl,requestId})});
   const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Không xử lý được payout CTV.');
   decisionRequestIds.current.delete(key);
   setMsg(d.idempotent?'Quyết định payout này đã được ghi nhận trước đó.':decision==='paid'?'Đã duyệt payout và ghi audit.':'Đã hủy payout và ghi audit.');
   await load();window.dispatchEvent(new Event('happygo-network-updated'));
  }catch(error){setMsg(`${error instanceof Error?error.message:'Không xử lý được payout CTV.'} Có thể bấm lại; hệ thống sẽ dùng cùng requestId để tránh xử lý trùng.`)}finally{decisionLocks.current.delete(payout.id);setProcessing(current=>current.filter(id=>id!==payout.id))}
 }
 const stats=data?.stats||{pendingCount:0,totalAmount:0,overdueCount:0,insufficientBalanceCount:0,oldestCreatedAt:''};
 return <section className="admin-panel affiliate-admin">
  <div className="admin-panel-head"><div><small>CTV PAYOUT QUEUE · PRODUCTION</small><h2>Yêu cầu rút tiền đang chờ</h2><p>Hàng chờ chuyên dụng chỉ tải dữ liệu cần cho payout. Mốc ưu tiên nội bộ: {priorityHours} giờ; payout chưa trừ số dư cho tới khi được duyệt.</p></div><button type="button" className="admin-secondary" onClick={()=>void load()} disabled={busy}>{busy?'Đang cập nhật...':'↻ Làm mới'}</button></div>
  {msg&&<p className="admin-api-note" aria-live="polite">{msg}</p>}
  <div className="affiliate-admin-kpis"><article><small>YÊU CẦU ĐANG CHỜ</small><b>{stats.pendingCount}</b><span>{stats.overdueCount} quá mốc {priorityHours}h</span></article><article><small>TỔNG TIỀN ĐANG CHỜ</small><b>{money(stats.totalAmount)}</b><span>chưa trừ số dư cho tới khi duyệt</span></article><article><small>THIẾU SỐ DƯ</small><b>{stats.insufficientBalanceCount}</b><span>cần kiểm tra trước khi duyệt</span></article><article><small>YÊU CẦU CŨ NHẤT</small><b>{stats.oldestCreatedAt?dateTime(stats.oldestCreatedAt):'—'}</b><span>ưu tiên xử lý trước</span></article></div>
  <div className="affiliate-admin-toolbar"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm CTV, ngân hàng, STK hoặc mã payout" aria-label="Tìm payout CTV"/><select value={filter} onChange={e=>setFilter(e.target.value as Filter)} aria-label="Lọc payout"><option value="all">Tất cả đang chờ</option><option value="overdue">Quá {priorityHours} giờ</option><option value="insufficient">Thiếu số dư</option></select><select value={sort} onChange={e=>setSort(e.target.value as Sort)} aria-label="Sắp xếp payout"><option value="oldest">Cũ nhất trước</option><option value="amount">Số tiền cao trước</option></select><span>Hiển thị {visible.length}/{stats.pendingCount}</span></div>
  <div className="affiliate-admin-table"><table><thead><tr><th>CTV</th><th>Số tiền</th><th>Số dư hiện tại</th><th>Tài khoản nhận</th><th>Tuổi yêu cầu</th><th>Thao tác</th></tr></thead><tbody>{visible.map(p=>{const locked=processing.includes(p.id),overdue=p.ageHours>=priorityHours;return <tr key={p.id}><td><b>{p.affiliateName}</b><small>{p.id.slice(0,8)}…</small></td><td><b>{money(p.amount)}</b></td><td><b>{money(p.affiliateBalance)}</b><small>{p.canPay?'Đủ số dư':'⚠ Không đủ để duyệt'}</small></td><td><b>{p.bankName||'Chưa có ngân hàng'}</b><small>{p.bankAccount||'—'} · {p.accountHolder||'Chưa có chủ tài khoản'}</small></td><td><b>{ageLabel(p.ageHours)}</b><small>{overdue?`⚠ Quá mốc ${priorityHours}h`:dateTime(p.createdAt)}</small></td><td><div className="pm-actions"><button type="button" className="admin-primary" onClick={()=>void resolve(p,'paid')} disabled={locked||!p.canPay} title={!p.canPay?'Số dư CTV hiện không đủ để duyệt payout.':''}>Duyệt chi</button><button type="button" className="danger-action" onClick={()=>void resolve(p,'cancelled')} disabled={locked}>Hủy yêu cầu</button></div></td></tr>})}{!visible.length&&!busy&&<tr><td colSpan={6}>{stats.pendingCount?'Không có payout phù hợp bộ lọc.':'Không có payout CTV đang chờ.'}</td></tr>}{busy&&!data&&<tr><td colSpan={6}>Đang tải hàng chờ payout...</td></tr>}</tbody></table></div>
 </section>;
}
