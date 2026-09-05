'use client';

import {useCallback,useEffect,useState} from 'react';

type Payout={id:string;affiliateName:string;amount:number;status:string;createdAt:string;bankAccount:string;bankName:string;accountHolder:string};
type Payload={payouts:Payout[]};

const money=(v:number)=>new Intl.NumberFormat('vi-VN').format(Math.round(v))+'đ';
const date=(v:string)=>v?new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short'}).format(new Date(v)):'—';

export function AdminAffiliatePayoutRequests(){
 const[items,setItems]=useState<Payout[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState('');

 const load=useCallback(async()=>{
  try{
   const r=await fetch('/api/admin/affiliates',{cache:'no-store'});
   const d=(await r.json().catch(()=>({}))) as Partial<Payload>&{error?:string};
   if(!r.ok){setMessage(d.error||'Không đọc được yêu cầu rút tiền.');return}
   setItems((d.payouts||[]).filter(p=>p.status==='pending'));
  }catch{setMessage('Không kết nối được hàng chờ đối soát CTV.')}
 },[]);
 useEffect(()=>{void load();const refresh=()=>void load();window.addEventListener('happygo-network-updated',refresh);return()=>window.removeEventListener('happygo-network-updated',refresh)},[load]);

 async function resolve(p:Payout,decision:'paid'|'cancelled'){
  if(decision==='cancelled'&&!window.confirm(`Từ chối yêu cầu rút ${money(p.amount)} của ${p.affiliateName}?`))return;
  const receiptUrl=decision==='paid'?(window.prompt('URL biên nhận HTTPS (có thể để trống)','')||''):'';
  setBusy(true);setMessage('');
  try{
   const r=await fetch('/api/admin/affiliates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'resolve_payout',payoutId:p.id,decision,receiptUrl})});
   const d=await r.json().catch(()=>({}));
   if(!r.ok){setMessage(d.error||'Không thể xử lý yêu cầu rút tiền.');return}
   setMessage(decision==='paid'?`Đã thanh toán ${money(p.amount)} cho ${p.affiliateName}.`:`Đã từ chối yêu cầu của ${p.affiliateName}.`);
   await load();
   window.dispatchEvent(new Event('happygo-network-updated'));
  }catch{setMessage('Không kết nối được API xử lý thanh toán.')}finally{setBusy(false)}
 }

 if(!items.length&&!message)return null;
 return <section className="admin-panel affiliate-payout-queue">
  <div className="admin-panel-head"><div><small>CTV · YÊU CẦU RÚT HOA HỒNG</small><h2>Thanh toán chờ đối soát</h2><p>Trạng thái “Chờ đối soát” chỉ trừ số dư ví sau khi Admin bấm thanh toán.</p></div><span className="affiliate-payout-count">{items.length} chờ đối soát</span></div>
  {message&&<p className="admin-api-note">{message}</p>}
  <div className="affiliate-payout-grid">{items.map(p=><article key={p.id}>
   <div className="affiliate-payout-person"><small>{date(p.createdAt)}</small><h3>{p.affiliateName}</h3><strong>{money(p.amount)}</strong></div>
   <div className="affiliate-payout-bank"><span>{p.bankName||'Chưa có ngân hàng'}</span><b>{p.bankAccount||'—'}</b><small>{p.accountHolder||'Chưa có chủ tài khoản'}</small></div>
   <div className="affiliate-payout-buttons"><button type="button" onClick={()=>void resolve(p,'cancelled')} disabled={busy}>Từ chối</button><button type="button" className="approve" onClick={()=>void resolve(p,'paid')} disabled={busy}>✓ Thanh toán</button></div>
  </article>)}</div>
 </section>;
}
